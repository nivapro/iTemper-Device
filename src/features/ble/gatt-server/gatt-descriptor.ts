import dbus from 'dbus-next';
import { Characteristic } from './gatt-characteristic';

import * as constants from './gatt-constants';

type Flag = 'Read' | 'Notify';
type FlagArray = Flag[];

type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};
export interface Properties {
    Characteristic: dbus.ObjectPath;
    UUID: string;
    Flags: FlagArray;
}
export interface Dict {
    [iface: string]: Properties;
}
export abstract class Descriptor {
    GATT_DESC_IFACE = 'org.bluez.GattDescriptor1';
    _path: string = '';
    _descriptors: Descriptor[] =[];
    _iface: dbus.interface.Interface;

    constructor(private uuid: string,
                private flags: FlagArray,
                private characteristic: Characteristic,
                private bus: dbus.MessageBus = constants.systemBus) {
            this.characteristic.addDescriptor(this);
    }
    public getPath(): string {
        return this._path;
    }
    setPath(path: string) {
        this._path = path;
    }
    public getProperties(): Dict {
        const properties: Dict  = {};
        properties[this.GATT_DESC_IFACE] =  {
            Characteristic: this.Characteristic,
            UUID: this.UUID,
            Flags: this.Flags,
        };
        return properties;
    }
    public publish(): void {
        this._iface = new dbus.interface.Interface(this.GATT_DESC_IFACE);
        const members: DbusMembers  = {
            properties: {
                Characteristic: {
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
            },
            methods: {
                ReadValue: {
                    outSignature: 'ay',
                },
                WriteValue: {
                    inSignature: 'ay',
                },
            },
        };
        dbus.interface.Interface.configureMembers(members);
        this.bus.export(this.getPath(), this._iface);
    }
        // Properties of the GATTCharacteristic1 interface, use org.freedesktop.DBus.Properties to Get and GetAll
    protected get Characteristic(): string {
        return this.characteristic.getPath();
    }
    protected get UUID(): string {
        return this.uuid;
    }
    protected get Flags(): FlagArray {
        return this.flags;
    }
    protected ReadValue(): void {
        throw Error();
    }

    protected WriteValue(value: Buffer): void {
        throw Error(value.toString());
    }
}
