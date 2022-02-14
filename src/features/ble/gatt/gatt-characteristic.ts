import dbus from 'dbus-next';
import * as constants from './gatt-constants';
import { GattDescriptor1 } from './gatt-descriptor';
import { Service } from './gatt-service';
import { DbusMembers, NotSupportedDBusError } from './gatt-utils';
import { stringify } from '../../../core/helpers'; 
import { log } from '../../../core/logger';
import { decode } from './gatt-utils';
// From Bluez 5.53 GATT API specification
interface ReadValueOptions {
    offset?:number;
    mtu?: number;
    device?: string;
} 
type Type = 'command'| 'request'| 'reliable';

interface WriteValueOptions {
    offset?: number,
	type?: Type,
    mtu?: number,
    device?: string,
	link?: string,
	'prepare-authorize'?: boolean
}
export type Flag = 'broadcast' | 'read' | 'write-without-response' | 'write' | 'notify' | 'indicate' | 
            'authenticated-signed-writes' | 'extended-properties' | 'reliable-write' | 'writable-auxiliaries' |
            'encrypt-read' | 'encrypt-write' | 'encrypt-notify' | 'encrypt-indicate' | 'encrypt-authenticated-read' |
            'encrypt-authenticated-write' | 'encrypt-authenticated-notify' | 'encrypt-authenticated-indicate' |
            'secure-read' | 'secure-write' | 'secure-notify' | 'secure-indicate' | 'authorize';

export type FlagArray = Flag[];

const m = "gatt-characteristic"
function label(f: string = ""){
    return m + "." + f + ": ";
} 
export interface CharacteristicProperties {
    Service: dbus.Variant<dbus.ObjectPath>;
    UUID: dbus.Variant<string>;
    Flags: dbus.Variant<FlagArray>;
    Descriptors: dbus.Variant<dbus.ObjectPath[]>;
}
export interface CharacteristicPropertyDict {
    [iface: string]: CharacteristicProperties;
}
export interface GATTCharacteristic1 {
    addDescriptor(descriptor: GattDescriptor1): void;
    getDescriptors(): GattDescriptor1[];
    getPath(): string;
    setPath(path: string): void;
    getProperties(): CharacteristicPropertyDict;
    export(): void;
}
export abstract class Characteristic<T>extends dbus.interface.Interface implements GATTCharacteristic1  {
    _path: string = '';
    _descriptors: GattDescriptor1[] =[];
    _descriptorIndex = 0;
    _readValueFn: () => Promise<T>;
    _writeValueFn: (value: T) => Promise<void>;
    _isValidFn: (raw: unknown) => boolean;
    constructor(
                protected _service: Service,
                protected _uuid: string,
                protected _flags: FlagArray,
                protected _bus: dbus.MessageBus = constants.systemBus) {
        super(constants.GATT_CHARACTERISTIC_INTERFACE);
        this._service.addCharacteristic(this);
    }
    public addDescriptor(descriptor: GattDescriptor1): void {
        descriptor.setPath(this.getPath() + '/desc' + this._descriptorIndex++);
        this._descriptors.push(descriptor);
    }
    public getDescriptors(): GattDescriptor1[] {
        return this._descriptors;
    }
    public getPath(): string {
        return this._path;
    }
    public setPath(path: string): void {
        this._path = path;
    }
    public getProperties(): CharacteristicPropertyDict {
        const properties: CharacteristicPropertyDict  = {};
        properties[constants.GATT_CHARACTERISTIC_INTERFACE] =  {
            Service: new dbus.Variant<dbus.ObjectPath>('o', this.Service),
            UUID: new dbus.Variant<string>('s', this.UUID),
            Flags: new dbus.Variant<FlagArray>('as', this.Flags),
            Descriptors: new dbus.Variant<dbus.ObjectPath[]>('ao', this.Descriptors),
        };
        return properties;
    }
    public export(): void {
        const members: DbusMembers  = {
            properties: {
                UUID: {
                    signature: 's',
                    access: dbus.interface.ACCESS_READ,
                },
                Service: {
                    signature: 'o',
                    access: dbus.interface.ACCESS_READ,
                },
                // Value: {
                //     signature: 'ay',
                //     access: dbus.interface.ACCESS_READ,
                // },
                Flags: {
                    signature: 'as',
                    access: dbus.interface.ACCESS_READ,
                },
            },
            methods: {
                ReadValue: {
                    inSignature: 'a{sv}',
                    outSignature: 'ay',
                },
                WriteValue: {
                    inSignature: 'aya{sv}',
                    outSignature: '',
                },
                StartNotify: {
                    inSignature: '',
                },
                StopNotify: {
                    inSignature: '',
                },
            },
        };
        Characteristic.configureMembers(members);
        this._bus.export(this.getPath(), this);
        this._descriptors.forEach(desc => desc.export());
    }
    // Properties of org.freedesktop.DBus.Properties.Get | GetAll
    private get Service(): string {
        return this._service.getPath();
    }
    private get UUID(): string {
        return this._uuid;
    }
    private get Flags(): FlagArray {
        return this._flags;
    }
    private get Descriptors(): string[] {
        const result: string[] = [];
        this._descriptors.forEach(desc => result.push(desc.getPath()));
        return result;
    }
    public setReadFn(fn: () => Promise<T>) {
        this._readValueFn = fn;
    }
    public setWriteFn(writeValueFn: (value: T) => Promise<void>, isValidFn: (raw: unknown) => boolean) {
        this._writeValueFn = writeValueFn;
        this._isValidFn = isValidFn;
    }
    // Methods members
    protected  ReadValue(options: ReadValueOptions): Promise<Buffer> {
        return new Promise ((resolve, reject) => {
            if (this._readValueFn === undefined) {
                reject ('ReadValue function undefined');
            } 
            this._readValueFn().then((value) => {
                const buffer = Buffer.from(stringify(value));
                const offset = options && options.offset ? options.offset : 0;
                if (offset < buffer.length){
                    resolve (buffer.slice(offset));
                } else {
                    reject('offset larger than buffer size')
                } 
            });
        }); 
    }
    protected WriteValue(data: Buffer, options: WriteValueOptions): Promise<void> {
        return new Promise ((resolve, reject) => {
            const offset = options && options.offset ? options.offset : 0;
            if (this._writeValueFn === undefined || offset > 0) {
                reject(new NotSupportedDBusError('WriteValue, value=: ' + data.toString()));
            }
            const raw = JSON.parse(decode(data));
            if (this._isValidFn(raw)){
                return this._writeValueFn(<T>raw).then(() => resolve());
            } else{
                reject('WriteValue, received invalid data');
            };
        });
    }
    protected StartNotify(): void {
        if (!this._flags.find(flag => flag === 'notify')) {
            throw new NotSupportedDBusError('StartNotify');
        } 
    }
    protected StopNotify(): void {
        if (!this._flags.find(flag => flag === 'notify')) {
            throw new NotSupportedDBusError('StopNotify');
        }
    }
}
