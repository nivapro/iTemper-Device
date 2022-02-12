import dbus from 'dbus-next';
import { Application } from './gatt-application';
import { Characteristic } from './gatt-characteristic';

import * as constants from './gatt-constants';

import { GATT_SERVICE_INTERFACE } from './gatt-constants';
export interface Properties {
    UUID: dbus.Variant<string>;
    Primary: dbus.Variant<boolean>;
    Characteristics: dbus.Variant<string []>;
}
export interface Dict {
    [iface: string]: Properties;
}

export interface GATTService1 {
    addCharacteristic(charactseristic: Characteristic): void;
    getCharacteristics(): Characteristic[];
    getPath(): string;
    getProperties(): Dict;
    publish(): void;
}

type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};
// org.bluez.GattService1 interface implementation
export class Service extends dbus.interface.Interface implements GATTService1 {
    _characteristics: Characteristic[] = [];
    _path: string = '';
    _charPathIndex = 0;
    self: Service;
    constructor(private uuid: string,
                private application: Application,
                private primary: boolean = true,
                private bus: dbus.MessageBus = constants.systemBus) {
        super(GATT_SERVICE_INTERFACE);
        this.self = this;
        this.application.addService(this);
    }
    // Methods for adding characteristics and publishing the interface on DBus.
    public addCharacteristic(charactseristic: Characteristic): void {
        charactseristic.setPath(this.getPath() + '/char' + this._charPathIndex++);
        this._characteristics.push(charactseristic);
    }
    public getCharacteristics(): Characteristic[] {
        return this._characteristics;
    }
    public publish(): void {
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
        this.bus.export(this.getPath(), this.self);
        this._characteristics.forEach(char => char.publish());
    }
    // Properties of the GATTService1 interface, use org.freedesktop.DBus.Properties to Get and GetAll
    private get UUID(): string {
        return this.uuid;
    }
    private get Primary(): boolean {
        return this.primary;
    }

    // getAllProperties is used when implementing org.freedesktop.DBus.GetManagedObjects.
    // Assumes dbus-next handles GetAll on org.freedesktop.DBus.Properties.
    public getProperties(): Dict {
        const properties: Dict  = {};
        const charPaths: string[] = [];
        this._characteristics.forEach(char => charPaths.push(char.getPath()));
        properties[GATT_SERVICE_INTERFACE] =  { 
            UUID: new dbus.Variant<string>('s', this.UUID), 
            Primary: new dbus.Variant<boolean>('b', this.Primary),  
            Characteristics: new dbus.Variant<string[]>('as', charPaths};
        return properties;
    }
    public getPath(): string {
        return this._path;
    }
    public setPath(path: string) {
        this._path = path;
    }
}
