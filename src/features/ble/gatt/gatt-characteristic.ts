import dbus from 'dbus-next';
import { Descriptor } from './gatt-descriptor';
import { Service } from './gatt-service';
type Flag = 'Read' | 'Notify';
type FlagArray = Flag[];
export interface Properties {
    Service: dbus.ObjectPath;
    UUID: string;
    Flags: FlagArray;
    Descriptors: dbus.ObjectPath[];
}
export interface CharacteristicProperties {
    [path: string]: Properties;
}

export interface GATTCharacteristic1 {
    addDescriptor(descriptor: Descriptor): void;
    getDescriptors(): Descriptor[];
    getPath(): string;
    getProperties(): CharacteristicProperties;
    publish(): void;
}

type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};
export class Characteristic implements GATTCharacteristic1 {
    GATT_CHARACTERISTIC_IFACE= 'org.bluez.GattCharacteristic1';
    _path: string = '';
    _descriptors: Descriptor[] =[];
    _iface: dbus.interface.Interface;
    constructor(
        private index: number,
        private uuid: string,
        private flags: FlagArray,
        private service: Service,
        private bus: dbus.MessageBus = dbus.systemBus() ) {
        this._path = this.service + '/char' + index;
    }

    public addDescriptor(descriptor: Descriptor): void {
        this._descriptors.push(descriptor);
    }
    public getDescriptors(): Descriptor[] {
        return this._descriptors;
    }
    public publish(): void {
        this._iface = new dbus.interface.Interface(this.GATT_CHARACTERISTIC_IFACE);
        const members: DbusMembers  = {
            properties: {
                Service: {
                    signature: 'o',
                    access: dbus.interface.ACCESS_READ,
                },
                UUID: {
                    signature: 's',
                    access: dbus.interface.ACCESS_READ,
                },
                Flags: {
                    signature: 'as',
                    access: dbus.interface.ACCESS_READ,
                },
                Descriptors: {
                    signature: 'ao',
                    access: dbus.interface.ACCESS_READ,
                },
            },
        };
        dbus.interface.Interface.configureMembers(members);
        this.bus.export(this.getPath(), this._iface);
    }
    // Properties of the GATTCharacteristic1 interface, use org.freedesktop.DBus.Properties to Get and GetAll
    protected get Service(): string {
        return this.service.getPath();
    }
    protected get UUID(): string {
        return this.uuid;
    }
    protected get Flags(): FlagArray {
        return this.flags;
    }
    protected get Descriptors(): string[] {
        const result: string[] = [];
        this._descriptors.map(desc => result.push(desc.getPath()));
        return result;
    }

    // getProperties is used when implementing org.freedesktop.DBus.GetManagedObjects.
    // Assumes dbus-next handles GetAll on org.freedesktop.DBus.Properties on the properties above
    public getProperties(): CharacteristicProperties {
        const properties: CharacteristicProperties  = {};
        properties[this.GATT_CHARACTERISTIC_IFACE] =  {
            Service: this.getPath(),
            UUID: this.UUID,
            Flags: this.flags,
            Descriptors: [],
        };
        return properties;
    }
    public getPath(): string {
        return this._path;
    }

    public getCharacteristics(): CharacteristicProperties {
        return {};

    }
}
