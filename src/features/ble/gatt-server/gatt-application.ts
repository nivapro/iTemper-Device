import * as characteristic from './gatt-characteristic';
import { GattManager1 } from '../bluez/org.bluez-gatt-class';

import * as constants from './gatt-constants';
import { log } from '../../../core/logger';
import * as descriptor from './gatt-descriptor';
import * as service from './gatt-service';

import dbus from 'dbus-next';

import { DbusMembers } from './gatt-utils';

export interface ManagedObjects {
    [key: string]: service.Dict | characteristic.Dict | descriptor.Dict;
}

const m = "gatt-application"
function label(f: string = ""){
    return m + "." + f + ": ";
}

// org.bluez.GattApplication1 interface implementation
export class Application extends dbus.interface.Interface  {
    _services: service.Service[] = [];
    _servicePathIndex = 0;
    constructor(private _path: string,
                private _bus: dbus.MessageBus = constants.systemBus) {
        super('org.freedesktop.DBus.ObjectManager');
    }
    // Properties & Methods of the interface org.freedesktop.DBus.ObjectManager
    private GetManagedObjects() {
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
        log.info(label("GetManagedObjects:") + JSON.stringify(response));
        return response;
    }
    // Methods for adding characteristics and publishing the interface on DBus.
    public addService(service: service.Service): void {
        service.setPath(this._path + '/service' + this._servicePathIndex++);
        this._services.push(service);
    }
    public getServices(): service.Service[] {
        return this._services;
    }
    public async publish(): Promise<void> {
        try{
            await this._bus.requestName(constants.BUS_NAME, 0);
            const members: DbusMembers  = {
                methods: {
                    GetManagedObjects: {
                        inSignature: '',
                        outSignature: 'a{oa{sa{sv}}}',
                    },
                },
            };
            Application.configureMembers(members);
            this._bus.export(this._path, this);
            this._services.forEach((serv) => serv.publish());
            log.info(label("publish") + "Application configured");
        }
        catch (e){
            log.error(label("publish") + "Could not request name and configure members, error=" + JSON.stringify(e));
        }
        try{
            const gattManager = await GattManager1.Connect(this._bus);
            gattManager.RegisterApplication(this._path, {});
            log.info(label("publish") + "Application registered on path " + this._path);
        } catch(e){
            log.error(label("publish") + "Could not register application on path " + this._path + ", error\n=" + JSON.stringify(e));
        } 
    }
}
