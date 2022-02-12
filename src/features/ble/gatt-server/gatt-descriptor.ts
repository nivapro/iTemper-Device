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
    UUID: dbus.Variant<string>;
    Characteristic: dbus.Variant<dbus.ObjectPath>;
    // Value: dbus.Variant<Buffer>;
    Flags: dbus.Variant<FlagArray>;
}
export interface Dict {
    [iface: string]: Properties;
}
export abstract class Descriptor extends dbus.interface.Interface {
    _path: string = '';
    _descriptors: Descriptor[] =[];
    _iface: dbus.interface.Interface;
    _value: Buffer = Buffer.from([0]);

    constructor(private _uuid: string,
                private _flags: FlagArray,
                private _characteristic: Characteristic,
                private _bus: dbus.MessageBus = constants.systemBus) {
                    super(constants.GATT_DESCRIPTOR_INTERFACE);
            this._characteristic.addDescriptor(this);
    }
    public getPath(): string {
        return this._path;
    }
    setPath(path: string) {
        this._path = path;
    }
    public getProperties(): Dict {
        const properties: Dict  = {};
        properties[constants.GATT_DESCRIPTOR_INTERFACE] = {
            Characteristic: new dbus.Variant<string> ('o', this.Characteristic),
            UUID: new dbus.Variant<string> ('s',this.UUID),
            // Value: new dbus.Variant<Buffer> ('ay',this.Value),
            Flags: new dbus.Variant<FlagArray> ('as', this.Flags),
        };
        return properties;
    }
    public publish(): void {
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
                // Value: {
                //     signature: 's',
                //     access: dbus.interface.ACCESS_READ,
                // },
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
        Descriptor.configureMembers(members);
        this._bus.export(this.getPath(), this._iface);
    }
        // Properties of the GATTCharacteristic1 interface, use org.freedesktop.DBus.Properties to Get and GetAll
    private get Characteristic(): string {
        return this._characteristic.getPath();
    }
    private get UUID(): string {
        return this._uuid;
    }
    private get Value(): Buffer {
        return this._value;
    }
    private get Flags(): FlagArray {
        return this._flags;
    }
    private ReadValue(): void {
        throw Error();
    }

    private WriteValue(value: Buffer): void {
        throw Error(value.toString());
    }
}
