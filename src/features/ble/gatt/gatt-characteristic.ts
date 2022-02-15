import dbus, { DBusError } from 'dbus-next';
import * as constants from './gatt-constants';
import { GattDescriptor1 } from './gatt-descriptor';
import { Service } from './gatt-service';
import { DbusMembers, NotSupportedDBusError, MethodOptions } from './gatt-utils';
import { stringify } from '../../../core/helpers'; 
import { log } from '../../../core/logger';
import { decode } from './gatt-utils';
import { FailedException, PropertyOptions } from '.';
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

export type Flag = 'broadcast' | 'extended-properties' | 'writable-auxiliaries' | 'authorize';

export type FlagArray = Flag[];

export type ReadFlag = 'read' | 'encrypt-read' | 'encrypt-authenticated-read' | 'secure-read';

export  type WriteFlag  = 'write' | 'write-without-response' |  'authenticated-signed-writes' | 'reliable-write'|
             'encrypt-authenticated-write' | 'secure-write';
export type NotifyFlag = 'notify' | 'encrypt-notify' | 'encrypt-authenticated-notify' | 'secure-notify';

export type indicateFlag = 'indicate' | 'encrypt-indicate' | 'encrypt-authenticated-indicate' | 'secure-indicate';

const m = "gatt-characteristic"
function label(f: string = ""){
    return m + "." + f + ": ";
} 
export interface CharacteristicProperties {
    Service: dbus.Variant<dbus.ObjectPath>;
    UUID: dbus.Variant<string>;
    Flags: dbus.Variant<string[]>;
    Descriptors?: dbus.Variant<dbus.ObjectPath[]>;
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
    _flags: string[] = []; 
    _readValueFn: () => Promise<T>;
    _writeValueFn: (value: T) => Promise<void>;
    _isValidFn: (raw: unknown) => boolean;
    _startNotifyFn: () => void;
    _stopNotifyFn: () => void;
    _indicateFn: () => void;

    _members: DbusMembers = { };

    constructor(
                protected _service: Service,
                protected _uuid: string,
                flags: FlagArray = [],
                protected _bus: dbus.MessageBus = constants.systemBus) {
        super(constants.GATT_CHARACTERISTIC_INTERFACE);
        
        this._service.addCharacteristic(this);
        
        this.addFlags(flags);
        this.addProperty('UUID', { signature: 's', access: dbus.interface.ACCESS_READ});
        this.addProperty('Service', { signature: 'o', access: dbus.interface.ACCESS_READ});
        this.addProperty('Flags', {signature: 'as', access: dbus.interface.ACCESS_READ });
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
            Flags: new dbus.Variant<string[]>('as', this.Flags),
            Descriptors: new dbus.Variant<dbus.ObjectPath[]>('ao', this.Descriptors),
        };
        return properties;
    }
    public export(): void {  
        Characteristic.configureMembers(this._members);
        this._bus.export(this.getPath(), this);
        this._descriptors.forEach(desc => desc.export());
        log.info(label('export') + 'members=' + JSON.stringify(this._members));
    }
    // Properties of org.freedesktop.DBus.Properties.Get | GetAll
    private get Service(): string {
        return this._service.getPath();
    }
    private get UUID(): string {
        return this._uuid;
    }
    private get Flags(): string[] {
        return this._flags;
    }
    private get Descriptors(): string[] {
        const result: string[] = [];
        this._descriptors.forEach(desc => result.push(desc.getPath()));
        return result;
    }
    private addFlags(flags: string[]): void {
        flags.forEach(flag => {
            if (this._flags.indexOf(flag) === -1) {
                this._flags.push(flag);
            }
        });
    }
    public addMethod(methodName: string, options: MethodOptions) {
        if (!this._members.methods){
            this._members['methods'] = { }
        } 
        this._members.methods[methodName] = options;
        log.info(label('addMethod') + JSON.stringify( this._members.methods));
    } 
    public addProperty(propertyName: string, options: PropertyOptions) {
        if (!this._members.properties){
            this._members['properties'] = { }
        } 
        this._members.properties[propertyName] = options;
        log.info(label('addProperty') + JSON.stringify( this._members.properties));      
    }    
    public enableReadValue(readValueFn: () => Promise<T>, flags: ReadFlag[] = ['read']) {
        this.addFlags(flags);
        this._readValueFn = readValueFn;
        this.addMethod('ReadValue', { inSignature: 'a{sv}', outSignature: 'ay' });
    }
    public enableWriteValue( writeValueFn: (value: T) => Promise<void>, isValidFn: (raw: unknown) => boolean, flags: WriteFlag[] = ['write']) {
        this.addFlags(flags);
        this._writeValueFn = writeValueFn;
        this._isValidFn = isValidFn;
        this.addMethod('WriteValue', { inSignature: 'aya{sv}', outSignature: '' });
    }
    public enableNotify(flags: NotifyFlag[], startNotifyFn: () => void, stopNotifyFn: () => void) {
        this.addFlags(flags);
        this._startNotifyFn = startNotifyFn;
        this._stopNotifyFn = stopNotifyFn;
        this.addMethod('StartNotify', { inSignature: '', outSignature: '' });
        this.addMethod('StopNotify',{ inSignature: '', outSignature: '' });
    }
    // Methods members
    protected  ReadValue(options: ReadValueOptions): Promise<Buffer> {

        return new Promise ((resolve, reject) => {
            if (this._readValueFn === undefined) {
                reject (new NotSupportedDBusError('ReadValue', constants.GATT_CHARACTERISTIC_INTERFACE));
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
                reject(new FailedException('WriteValue, value=: ' + data.toString(), constants.GATT_CHARACTERISTIC_INTERFACE));
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
        if (!this._startNotifyFn) {
            throw new NotSupportedDBusError('StartNotify', constants.GATT_CHARACTERISTIC_INTERFACE);
        } else{
            this._startNotifyFn();
        } 
    }
    protected StopNotify(): void {
        if (!this._stopNotifyFn) {
            throw new NotSupportedDBusError('StopNotify', constants.GATT_CHARACTERISTIC_INTERFACE);
        } else{
            this._stopNotifyFn();
        } 
    }
}
