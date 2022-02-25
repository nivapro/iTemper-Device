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
    private _path: string = '';
    private _descriptors: GattDescriptor1[] =[];
    private _descriptorIndex = 0;
    private _flags: string[] = []; 
    private _readValueFn: () => T ;
    private _readValueAsync: () => Promise<T> ;
    private _writeValueFn: (value: T) => void ;
    private _writeValueAsync: (value: T) => Promise<void> ;
    private _isValidFn: (raw: unknown) => boolean;
    private _startNotifyFn: () => void;
    private _stopNotifyFn: () => void;
    private _indicateFn: () => void;
    private _notifying: boolean = false;
    private _cachedValue: Buffer;
    private _mtu: number = 185;
    private _members: DbusMembers = { };

    static ValueChanged<T>(iface: Characteristic<T>) {
        dbus.interface.Interface.emitPropertiesChanged(iface, {Value: iface.Value }, []);
    }

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
        this.addProperty('MTU', {signature: 'q', access: dbus.interface.ACCESS_READ });
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
    protected get Value(): Buffer {
        return this._cachedValue;
    }
    protected set Value(value: Buffer) {
        this._cachedValue = value;
    }
    protected get Notifying(): boolean {
        return this._notifying;
    }
    protected set Notifying(value: boolean) {
        this._notifying = value;
    }
    protected get MTU(): number {
        return this._mtu;
    }
    protected set MTU(value: number) {
        this._mtu = value;
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
        if (!this._members.properties[propertyName]) {
            this._members.properties[propertyName] = options;
            log.info(label('addProperty') + 'Added '+ JSON.stringify( this._members.properties)); 
        }
    }    
    public enableReadValue(readValueFn: () => Promise<T> | T , flags: ReadFlag[] = ['read']) {
        this.addFlags(flags);
        if (readValueFn.constructor === Promise){
            this._readValueAsync = <() => Promise<T>> readValueFn;

        } else {
            this._readValueFn = <() => T> readValueFn.bind(this);
        } 

        this.addMethod('ReadValue', { inSignature: 'a{sv}', outSignature: 'ay' });
    }
    public enableWriteValue( writeValueFn: (value: T) => Promise<void> | void , isValidFn: (raw: unknown) => boolean, flags: WriteFlag[] = ['write']) {
        this.addFlags(flags);
        if (writeValueFn.constructor === Promise){
            this._writeValueAsync = <(value: T) => Promise<void>> writeValueFn;

        } else {
            this._writeValueFn = <(value: T) => void> writeValueFn.bind(this);
        } 
        this._isValidFn = isValidFn.bind(this);
        this.addMethod('WriteValue', { inSignature: 'aya{sv}', outSignature: '' });
    }
    public enableNotify(startNotifyFn: () => void, stopNotifyFn: () => void, flags: NotifyFlag[] = ['notify'] ) {
        this.addFlags(flags);
        this._startNotifyFn = startNotifyFn.bind(this);
        this._stopNotifyFn = stopNotifyFn.bind(this);
        this.addMethod('StartNotify', { inSignature: '', outSignature: '' });
        this.addMethod('StopNotify',{ inSignature: '', outSignature: '' });
        this.addProperty('Value', { signature: 'ay', access: dbus.interface.ACCESS_READ })
        this.addProperty('Notifying', {signature: 'b', access: dbus.interface.ACCESS_READ })
    }
    private encode (value: T, options: ReadValueOptions): Buffer {
        const buffer = Buffer.from(stringify(value));
        const offset = options && options.offset ? options.offset : 0;
        if (offset < buffer.length){
            return buffer.slice(offset);
        } else {
            throw new FailedException('offset larger than buffer size', constants.GATT_CHARACTERISTIC_INTERFACE);
        }
    }
    // Takes a stringified data buffer, checks validity and convert it to T
    private convert(data: Buffer, options: WriteValueOptions): T {
        const offset = options.offset? options.offset : 0;
        if (offset > 0) {
            throw new NotSupportedDBusError('Write with offset > 0 not supported, offset=' + offset, constants.GATT_CHARACTERISTIC_INTERFACE);
        }
        const decoded = decode(data);
        log.info(label('decode') + 'decoded=' + decoded);
        try{
            const raw = JSON.parse(decoded); 
            log.info(label('decode') + 'raw=' + JSON.stringify(raw));
            if (this._isValidFn(raw)){
                return <T>raw;
            } else {
                throw new FailedException('WriteValue.convert, received invalid data', constants.GATT_CHARACTERISTIC_INTERFACE);
            };
        } catch (e){
            log.error('convert. Cannot parse JSON.' + e);
            throw new FailedException('WriteValue.convert, cannot convert value' + e, constants.GATT_CHARACTERISTIC_INTERFACE);
        } 


    } 
    protected  ReadValue(options: ReadValueOptions): Promise<Buffer> | Buffer  {
        if ( this._readValueAsync !== undefined) {
            return new Promise((resolve) => {
                log.info(label('ReadValue') + 'async, options=' + JSON.stringify(options));
                this._readValueAsync().then ((value: T) => {
                    resolve(this.encode(value, options));
                });
            } )
        } else if (this._readValueFn !== undefined){
            log.info(label('ReadValue') + 'synch, options=' + JSON.stringify(options));
            return this.encode(this._readValueFn(), options);
        }  else {
            throw new NotSupportedDBusError('ReadValue', constants.GATT_CHARACTERISTIC_INTERFACE);
        } 
    }
    protected WriteValue(data: Buffer, options: WriteValueOptions): Promise<void> | void  {
        log.info(label('WriteValue') + 'options=' + JSON.stringify(options));
        log.info(label('WriteValue') + 'data=' + JSON.stringify(data));
        const value = this.convert(data, options);
        if (this._writeValueAsync !== undefined) {
            log.debug(label('WriteValue') + '_writeValueAsync');
            return this._writeValueAsync (value);
        } else if (this._writeValueFn !== undefined){
            log.debug(label('WriteValue') + '_writeValueFn');
            this._writeValueFn(value);
        } else {
            throw new NotSupportedDBusError('WriteValue', constants.GATT_CHARACTERISTIC_INTERFACE);
        } 
    }
    protected StartNotify(): void {
        if (!this._startNotifyFn) {
            throw new NotSupportedDBusError('StartNotify', constants.GATT_CHARACTERISTIC_INTERFACE);
        } else{
            this.Notifying = true;
            this._startNotifyFn();
        } 
    }
    protected StopNotify(): void {
        if (!this._stopNotifyFn) {
            throw new NotSupportedDBusError('StopNotify', constants.GATT_CHARACTERISTIC_INTERFACE);
        } else{
            this.Notifying = false;
            this._stopNotifyFn();
        } 
    }
}
