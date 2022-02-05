import dbus from 'dbus-next';
import { Application } from './gatt-application';
import { Characteristic } from './gatt-characteristic';

import { GATT_SERVICE_INTERFACE } from './gatt-constants';
export interface Properties {
    UUID: string;
    Primary: boolean;
    Characteristics: string [];
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
    constructor(private uuid: string,
                private application: Application,
                private primary: boolean = true,
                private bus: dbus.MessageBus = dbus.systemBus()) {
        super(GATT_SERVICE_INTERFACE);
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
                Characteristics: {
                    signature: 'as',  // or an 'o' signature?
                    access: dbus.interface.ACCESS_READ,
                },
            },
        };
        dbus.interface.Interface.configureMembers(members);
        this.bus.export(this.getPath(), this);
        this._characteristics.forEach((char) => char.publish());
    }
    // Properties of the GATTService1 interface, use org.freedesktop.DBus.Properties to Get and GetAll
    protected get UUID(): string {
        return this.uuid;
    }

    protected get Primary(): boolean {
        return this.primary;
    }
    protected get Characteristics(): string[] {
        const result: string[] = [];
        this._characteristics.map(char => result.push(char.getPath()));
        return result;
    }

    // getAllProperties is used when implementing org.freedesktop.DBus.GetManagedObjects.
    // Assumes dbus-next handles GetAll on org.freedesktop.DBus.Properties.
    public getProperties(): Dict {
        const properties: Dict  = {};
        properties[GATT_SERVICE_INTERFACE] =  { UUID: this.UUID, Primary: this.Primary,  Characteristics: [] };
        return properties;
    }
    public getPath(): string {
        return this._path;
    }
    public setPath(path: string) {
        this._path = path;
    }
}
