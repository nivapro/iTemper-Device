import dbus from 'dbus-next';
import { Characteristic } from './gatt-characteristic';
export interface Properties {
    UUID: string;
    Primary: boolean;
    Characteristics: string [];
}
export interface ServiceProperties {
    [iface: string]: Properties;
}

export interface GATTService1 {
    addCharacteristic(charactseristic: Characteristic): void;
    getCharacteristics(): Characteristic[];
    getPath(): string;
    getProperties(): ServiceProperties;
    publish(): void;
}

type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};

// org.bluez.GattService1 interface implementation
export class Service implements GATTService1 {
    GATT_SERVICE_IFACE = 'org.bluez.GattService1';
    _characteristics: Characteristic[] = [];
    _path: string = '';
    _iface: dbus.interface.Interface;
    static Index: number = 0;
    static newIndex() {
        return Service.Index++;
    }
    constructor(
                private pathBase: string,
                private uuid: string,
                private primary: boolean,
                private bus: dbus.MessageBus = dbus.systemBus() ) {
    this._path = this.pathBase + '/service' + Service.newIndex();
    }
    // Methods for adding characteristics and publishing the interface on DBus.
    public addCharacteristic(charactseristic: Characteristic): void {
        this._characteristics.push(charactseristic);
    }
    public getCharacteristics(): Characteristic[] {
        return this._characteristics;
    }
    public publish(): void {
        this._iface = new dbus.interface.Interface(this.GATT_SERVICE_IFACE);
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
        this.bus.export(this.getPath(), this._iface);
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
    public getProperties(): ServiceProperties {
        const properties: ServiceProperties  = {};
        properties[this.GATT_SERVICE_IFACE] =  { UUID: this.UUID, Primary: this.Primary,  Characteristics: [] };
        return properties;
    }

    public getPath(): string {
        return this._path;
    }

}
