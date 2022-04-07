import * as characteristic from './gatt-characteristic';
import { GattManager1 } from '../bluez/org.bluez-gatt-class';

import * as constants from './gatt-constants';
import { log } from '../../../core/logger';
import * as descriptor from './gatt-descriptor';
import * as service from './gatt-service';
import * as utils from './gatt-utils'

import dbus from 'dbus-next';

import { DbusMembers } from './gatt-utils';

import  { setBusName } from '../../../core/dbus';

export interface ManagedObjects {
    [key: string]: service.ServicePropertyDict |
                   characteristic.CharacteristicPropertyDict |
                   descriptor.DescriptorPropertyDict;
}

const m = "gatt-application"
function label(f: string = ""){
    return m + "." + f + ": ";
}

// org.bluez.GattApplication1 interface implementation
export class Application extends dbus.interface.Interface  {
    _services: service.GATTService1[] = [];
    _servicePathIndex = 0;
    static IFACE = 'org.freedesktop.DBus.ObjectManager';
    constructor(private _path: string,
                private _name: string,
                private _bus: dbus.MessageBus = constants.systemBus) {
        super(Application.IFACE);
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
        return response;
    }
    // Methods for adding characteristics and publishing the interface on DBus.
    public addService(service: service.Service): void {
        service.setPath(this._path + '/service' + this._servicePathIndex++);
        log.debug(label('addService') + ', path=' + this._path);
        this._services.push(service);
        log.info(label('addService') + 'Completed');
    }
    public getServices(): service.GATTService1[] {
        return this._services;
    }
    public async close(): Promise<void> {
        const adapterPath = constants.BLUEZ_NAMESPACE + constants.ADAPTER_NAME;
        try{
            const gattManager = await GattManager1.Connect(this._bus, adapterPath);
            await gattManager. UnregisterApplication(this._path);
            log.info(label("publish") + 'Application unregistered');
        } catch(e){
            log.error(label("publish") + "Could not unregister application, error\n=" + JSON.stringify(e));
        } 

    } 
    public async init(): Promise<void> {
        const adapterPath = constants.BLUEZ_NAMESPACE + constants.ADAPTER_NAME;
        const members: DbusMembers  = {
            methods: {
                GetManagedObjects: {
                    inSignature: '',
                    outSignature: 'a{oa{sa{sv}}}',
                },
            },
        };
        await setBusName(this._name);
        Application.configureMembers(members);
        log.debug(label("init") + Application.IFACE + ' DBus members configured');
        this._bus.export(this._path, this);
        log.debug(label("init") + 'Interface ' + Application.IFACE + ' exported on path ' +  this._path);
        this._services.forEach((serv) => serv.export());
        log.debug(label("init") + "Application configured");
        try{
            const gattManager = await GattManager1.Connect(this._bus, adapterPath);
            log.debug(label("init") + "GATT Manager connected on path " + adapterPath);
            await gattManager.RegisterApplication(this._path, {});
            log.info(label("init") + "Application registered on path " + this._path);
        } catch(e){
            log.error(label("init") + "Could not register application on path " + this._path + ", error\n=" + JSON.stringify(e));
        } 
    }
}
