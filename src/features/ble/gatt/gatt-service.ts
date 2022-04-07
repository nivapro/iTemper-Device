import dbus from 'dbus-next';
import { Application } from './gatt-application';
import { Characteristic, GATTCharacteristic } from './gatt-characteristic';

import * as constants from './gatt-constants';
import { GATT_SERVICE_INTERFACE } from './gatt-constants';

import { log } from '../../../core/logger';

export interface ServiceProperties {
    UUID: dbus.Variant<string>;
    Primary: dbus.Variant<boolean>;
    Characteristics: dbus.Variant<string []>;
}
export interface ServicePropertyDict {
    [iface: string]: ServiceProperties;
}
export interface ManagedServiceObjects {
    [path: string]: ServicePropertyDict;
}
const m = "gatt-service"
function label(f: string = ""){
    return m + "." + f + ": ";
}
export interface GATTService {
    addCharacteristic(charactseristic: GATTCharacteristic): void;
    getCharacteristics(): GATTCharacteristic[];
    getPath(): string;
    setPath(path: string): void;
    getProperties(): ServicePropertyDict;
    export(): void;
}
type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};
// org.bluez.GattService1 interface implementation
export class Service extends dbus.interface.Interface implements GATTService {
    _characteristics: GATTCharacteristic[] = [];
    _path: string = '';
    _charPathIndex = 0;
    self: Service;
    // _objectManager: ObjectManager;
    constructor(private _uuid: string,
                private _application: Application,
                private _primary: boolean = true,
                private _bus: dbus.MessageBus = constants.systemBus) {
        super(GATT_SERVICE_INTERFACE);
        this.self = this;
        this._application.addService(this);
        // this._objectManager = new ObjectManager(this);
    }
    // Methods for adding characteristics and publishing the interface on DBus.
    public addCharacteristic(charactseristic: GATTCharacteristic): void {
        charactseristic.setPath(this.getPath() + '/char' + this._charPathIndex++);
        this._characteristics.push(charactseristic);
    }
    public getCharacteristics(): GATTCharacteristic[] {
        return this._characteristics;
    }
    public export(): void {
        const members: DbusMembers  = {
            properties: {
                UUID: {
                    signature: 's',
                    access: dbus.interface.ACCESS_READ,
                },
                Primary: {
                    signature: 'b',
                    access: dbus.interface.ACCESS_READ,
                },
            },
        };
        Service.configureMembers(members);
        this._bus.export(this._path, this);
        log.info(label("export") + GATT_SERVICE_INTERFACE + ' exported on path ' +  this._path);
        this._characteristics.forEach(char => char.export());
    }
    // Properties of the GATTService1 interface, use org.freedesktop.DBus.Properties to Get and GetAll
    private get UUID(): string {
        return this._uuid;
    }
    private get Primary(): boolean {
        return this._primary;
    }
    // getAllProperties is used when implementing org.freedesktop.DBus.GetManagedObjects.
    // Assumes dbus-next handles GetAll on org.freedesktop.DBus.Properties.
    public getProperties(): ServicePropertyDict {
        const properties: ServicePropertyDict  = {};
        const charPaths: string[] = [];
        this._characteristics.forEach(char => charPaths.push(char.getPath()));
        properties[GATT_SERVICE_INTERFACE] =  { 
            UUID: new dbus.Variant<string>('s', this.UUID), 
            Primary: new dbus.Variant<boolean>('b', this.Primary),  
            Characteristics: new dbus.Variant<string[]>('as', charPaths )};
        return properties;
    }
    public getPath(): string {
        return this._path;
    }
    public setPath(path: string) {
        this._path = path;
    }
}
