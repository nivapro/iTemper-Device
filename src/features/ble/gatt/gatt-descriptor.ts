import dbus from 'dbus-next';
import { GATTCharacteristic } from './gatt-characteristic';
import { DbusMembers, NotSupportedDBusError } from './gatt-utils';
import { stringify } from '../../../core/helpers'; 

import * as constants from './gatt-constants';

type Flag = 'Read' | 'Notify';
type FlagArray = Flag[];

export interface DescriptorProperties {
    UUID: dbus.Variant<string>;
    Characteristic: dbus.Variant<dbus.ObjectPath>;
    // Value: dbus.Variant<Buffer>;
    Flags: dbus.Variant<FlagArray>;
}
export interface DescriptorPropertyDict {
    [iface: string]: DescriptorProperties;
}
export interface GattDescriptor1 {
    getPath(): string;
    setPath(path: string): void;
    getProperties(): DescriptorPropertyDict;
    export(): void;
}
interface ReadValueOptions {
    offset?:number;
    device?: string;
} 
interface WriteValueOptions {
    offset?: number,
    device?: string,
	'prepare-authorize'?: boolean
}

export class Descriptor extends dbus.interface.Interface implements GattDescriptor1 {
    _path: string = '';
    _descriptors: Descriptor[] =[];
    protected _value: Buffer = Buffer.from([0]);
    _readValueFn: () => Buffer;
    _writeValueFn: (value: Buffer) => boolean;

    constructor(protected _uuid: string,
                protected _characteristic: GATTCharacteristic,
                protected _flags: FlagArray,
                protected _bus: dbus.MessageBus = constants.systemBus) {
                    super(constants.GATT_DESCRIPTOR_INTERFACE);
            this._characteristic.addDescriptor(this);
    }
    public getPath(): string {
        return this._path;
    }
    public setPath(path: string): void {
        this._path = path;
    }
    public getProperties(): DescriptorPropertyDict {
        const properties: DescriptorPropertyDict  = {};
        properties[constants.GATT_DESCRIPTOR_INTERFACE] = {
            UUID: new dbus.Variant<string> ('s',this.UUID),
            Characteristic: new dbus.Variant<dbus.ObjectPath> ('o', this.Characteristic),
            // Value: new dbus.Variant<Buffer> ('ay',this.Value),
            Flags: new dbus.Variant<FlagArray> ('as', this.Flags),
        };
        return properties;
    }
    public export(): void {
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
        this._bus.export(this.getPath(), this);
    }
        // Properties of the GATTCharacteristic1 interface, use org.freedesktop.DBus.Properties to Get and GetAll
    public get Characteristic(): string {
        return this._characteristic.getPath();
    }
    public get UUID(): string {
        return this._uuid;
    }
    public get Value(): Buffer {
        return this._value;
    }
    public set Value(value: Buffer) {
        this._value = value;
    }
    private get Flags(): FlagArray {
        return this._flags;
    }
    public setReadFn(fn: () => Buffer) {
        this._readValueFn = fn;
    }
    public setWriteFn(fn: (value: unknown) => boolean) {
        this._writeValueFn = fn;
    }
    protected ReadValue(options: ReadValueOptions): Buffer {
        if (this._readValueFn === undefined) {
            throw new NotSupportedDBusError('ReadValue', constants.GATT_DESCRIPTOR_INTERFACE);
        } 
        const value = Buffer.from(stringify(this._readValueFn()));
        const offset = options && options.offset && options.offset < value.length ? options.offset : 0;
        return value.slice(offset);;
    }
    protected WriteValue(value: Buffer, options: WriteValueOptions): Promise<void> {
        const offset = options && options.offset && options.offset < value.length ? options.offset : 0;
        if (this._writeValueFn === undefined || offset > 0 ) {
            throw new NotSupportedDBusError('WriteValue offset=: ' + offset, constants.GATT_DESCRIPTOR_INTERFACE);
        } else {
            const valid = this._writeValueFn(value);
        } 
        throw new NotSupportedDBusError('WriteValue, value=: ' + value.toString(), constants.GATT_DESCRIPTOR_INTERFACE);
    }
}
export class UserDescriptor extends Descriptor {
    constructor(value: string, protected _characteristic: GATTCharacteristic){
        super('0x2901', _characteristic, ['Read']);
        this._value = Buffer.from(value);
        this.setReadFn(() => this._value)
    } 
} 