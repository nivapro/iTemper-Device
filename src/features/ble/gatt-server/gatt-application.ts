import * as characteristic from './gatt-characteristic';

import * as constants from './gatt-constants';
import * as descriptor from './gatt-descriptor';
import * as service from './gatt-service';

import dbus from 'dbus-next';

import { DbusMembers } from './gatt-utils';

export interface ManagedObjects {
    [key: string]: service.Dict | characteristic.Dict | descriptor.Dict;
}

// org.bluez.GattApplication1 interface implementation
export class Application extends dbus.interface.Interface  {
    _services: service.Service[] = [];
    _servicePathIndex = 0;
    constructor(private path: string,
                private bus: dbus.MessageBus = constants.systemBus) {
        super('org.freedesktop.DBus.ObjectManager');
    }
    // Properties & Methods of the interface org.freedesktop.DBus.ObjectManager
    protected GetManagedObjects() {
        const response: ManagedObjects = {};
        this._services.forEach ((serv) => {
            response[serv.getPath()] = serv.getProperties();
            const chrcs = serv.getCharacteristics();
            chrcs.forEach((chrc) => {
                response[chrc.getPath()] = chrc.getProperties();
                const descs = chrc.getDescriptors();
                descs.forEach((desc) => response[desc.getPath()] = desc.getProperties());

            });
        });
        return response;
    }
    // Methods for adding characteristics and publishing the interface on DBus.
    public addService(service: service.Service): void {
        service.setPath(this.path + '/service' + this._servicePathIndex++);
        this._services.push(service);
    }
    public getServices(): service.Service[] {
        return this._services;
    }
    public async publish(): Promise<void> {
        await this.bus.requestName(constants.BUS_NAME, 0);
        const members: DbusMembers  = {
            methods: {
                GetManagedObjects: {
                    inSignature: '',
                    outSignature: 'a{oa{sa{sv}}}',
                },
            },
        };
        dbus.interface.Interface.configureMembers(members);
        this.bus.export(this.path, this);
        this._services.forEach((serv) => serv.publish());
        this.bus.requestName('io.itemper', 0);
    }
}
