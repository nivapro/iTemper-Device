import dbus, { DBusError } from 'dbus-next';
import * as constants from './gatt-constants';
import { GattDescriptor1 } from './gatt-descriptor';
import { Service } from './gatt-service';
import { DbusMembers, NotSupportedDBusError, MethodOptions } from './gatt-utils';
import { stringify } from '../../../core/helpers'; 
import { log } from '../../../core/logger';
import { decode } from './gatt-utils';
import { FailedException, PropertyOptions } from '.';
import { resolve } from 'dns';
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

export interface CharacteristicProperties {
    Service: dbus.Variant<dbus.ObjectPath>;
    UUID: dbus.Variant<string>;
    Flags: dbus.Variant<string[]>;
    Descriptors?: dbus.Variant<dbus.ObjectPath[]>;
}
export interface CharacteristicPropertyDict {
    [iface: string]: CharacteristicProperties;
}
export interface GATTCharacteristic {
    addDescriptor(descriptor: GattDescriptor1): void;
    getDescriptors(): GattDescriptor1[];
    getPath(): string;
    setPath(path: string): void;
    getProperties(): CharacteristicPropertyDict;
    getMembers(): DbusMembers;
    export(): void;
}
const m = 'gatt-characteristic';
function label(f: string = '') {
    return m + '.' + f + ': ';
}
export abstract class Characteristic<T>extends dbus.interface.Interface implements GATTCharacteristic  {
    // Class properties GATTCharacteristic implementation 
    private _descriptors: GattDescriptor1[] =[];
    private _descriptorIndex = 0;
    private _path: string = '';
    // Class properties for org.bluez.GattCharacteristic1 method implementation 
    private _readValueFn: () => T ;
    private _readValueAsync: () => Promise<T> ;
    private _writeValueFn: (value: T) => void ;
    private _writeValueAsync: (value: T) => Promise<void> ;
    private _isValidFn: (raw: unknown) => boolean;
    private _startNotifyFn: () => void;
    private _stopNotifyFn: () => void;
    // Class properties for org.bluez.GattCharacteristic1 property implementation 
    private _flags: string[] = [];
    private _mtu: number = 185;
    private _members: DbusMembers = { };
    private _notifying: boolean = false;
    private _cachedValue: Buffer;

    // Check that nothing is added to the DBUS interface after it has been exported.
    private _exported = false;

    // Is this static needed? Tries to emit when Value changed instead, see below
    protected static ValueChanged<T>(iface: Characteristic<T>) {
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
        this.addProperty('Service', { signature: 'o', access: dbus.interface.ACCESS_READ});
        this.addProperty('UUID', { signature: 's', access: dbus.interface.ACCESS_READ});
        this.addProperty('Flags', {signature: 'as', access: dbus.interface.ACCESS_READ });
        this.addProperty('MTU', {signature: 'q', access: dbus.interface.ACCESS_READ });
    }
    // GATTCharacteristic implementation
    public addDescriptor(descriptor: GattDescriptor1): void {
        this.checkExported('addDescriptor ');
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
        const descriptorPaths: string[] = []; 
        this._descriptors.forEach(desc => descriptorPaths.push(desc.getPath()));
        properties[constants.GATT_CHARACTERISTIC_INTERFACE] =  {
            Service: new dbus.Variant<dbus.ObjectPath>('o', this.Service),
            UUID: new dbus.Variant<string>('s', this.UUID),
            Flags: new dbus.Variant<string[]>('as', this.Flags),
            Descriptors:  descriptorPaths.length === 0
                ? undefined
                : new dbus.Variant<dbus.ObjectPath[]>('ao', descriptorPaths),
        };
        return properties;
    }
    public getMembers (){
        return this._members;
    } 
    public export(): void {
        this._bus.export(this._path, this);
        log.info(label("export") + constants.GATT_CHARACTERISTIC_INTERFACE + ' exported on path ' +  this._path);
        this._descriptors.forEach(desc => desc.export());
        this._exported = true;
    }
    // Mandatory properties of org.bluez.GattCharacteristic1
    protected get Service(): string {
        return this._service.getPath();
    }
    protected get UUID(): string {
        return this._uuid;
    }
    protected get Flags(): string[] {
        return this._flags;
    }
    protected get MTU(): number {
        return this._mtu;
    }
    protected set MTU(value: number) {
        this._mtu = value;
    }
    // Optional properties of org.bluez.GattCharacteristic1
    protected get Value(): Buffer {
        return this._cachedValue;
    }
    protected set Value(value: Buffer) {
        if (this._cachedValue !== value) {
            this._cachedValue = value;
            dbus.interface.Interface.emitPropertiesChanged(this, {Value: this.Value }, []);
        } 
    }
    protected get Notifying(): boolean {
        return this._notifying;
    }
    protected set Notifying(value: boolean) {
        this._notifying = value;
    }
    // Methods of org.bluez.GattCharacteristic1
    protected async ReadValue(options: ReadValueOptions): Promise<Buffer> {
        const self = this;
        log.debug(label('ReadValue') + ', options=' + JSON.stringify(options));
        return new Promise((resolve) => {
            if (self._readValueAsync !== undefined) { 
                log.debug(label('ReadValue') + 'async');
                self._readValueAsync().then ((value: T) => {
                    log.info(label('ReadValue') + 'async, value=' + JSON.stringify(value));
                    this.Value = self.encode(value, options);
                    resolve(this.Value);
                });
            } else if (self._readValueFn !== undefined) {
                log.info(label('ReadValue') + 'synch');
                this.Value = self.encode(self._readValueFn(), options);
                resolve(this.Value);
            }  else {
                log.error(label('ReadValue') + 'Not supported DBus error');
                throw new NotSupportedDBusError('ReadValue', constants.GATT_CHARACTERISTIC_INTERFACE);
            }
        });
    }
    protected async WriteValue(data: Buffer, options: WriteValueOptions): Promise<void>   {
        const self = this;
        return new Promise((resolve, reject) => {
            log.info(label('WriteValue') + 'options=' + JSON.stringify(options));
            log.info(label('WriteValue') + 'data=' + JSON.stringify(data));
            const value = self.convert(data, options);
            if (self._writeValueAsync !== undefined) {
                log.debug(label('WriteValue') + '_writeValueAsync');
                self._writeValueAsync (value).then (() => resolve());
            } else if (self._writeValueFn !== undefined){
                log.debug(label('WriteValue') + '_writeValueFn');
                self._writeValueFn(value);
                resolve();
            } else {
                log.error(label('WriteValue') + 'Not supported DBus error');
                reject('WriteValue'+ constants.GATT_CHARACTERISTIC_INTERFACE);
            }
        } )

    }
    protected StartNotify(): void {
        if (!this._startNotifyFn) {
            log.error(label('StartNotify') + 'Not supported DBus error');
            throw new NotSupportedDBusError('StartNotify', constants.GATT_CHARACTERISTIC_INTERFACE);
        } else{
            this.Notifying = true;
            this._startNotifyFn();
            log.info(label('StartNotify'));
        } 
    }
    protected StopNotify(): void {
        if (!this._stopNotifyFn) {
            log.error(label('StopNotify') + 'Not supported DBus error');
            throw new NotSupportedDBusError('StopNotify', constants.GATT_CHARACTERISTIC_INTERFACE);
        } else {
            this.Notifying = false;
            this._stopNotifyFn();
            log.info(label('StartNotify'));
        }
    }
    // Class Methods
    protected addFlags(flags: string[]): void {
        this.checkExported('addFlags [' + flags.map((f, index )=> index !== 0 ? ',':'' + f) + ']');
        flags.forEach(flag => {
            if (this._flags.indexOf(flag) === -1) {
                this._flags.push(flag);
            }
        });
    }
    protected addMethod(methodName: string, options: MethodOptions) {
        this.checkExported('addMethod: ' + methodName);
        if (!this._members.methods) {
            this._members['methods'] = {};
        }
        if (!(methodName in this._members.methods)) {
            this._members.methods[methodName] = options;
        } else {
            log.error(label('addMethod') + methodName + 'exists already')
            throw new Error('Method ' + methodName + 'exists already')
        } 
    }
    protected addProperty(propertyName: string, options: PropertyOptions) {
        this.checkExported('addProperty: ' + propertyName);
        if (!this._members.properties) {
            this._members['properties'] = {};
        }
        if (!(propertyName in this._members.properties)) {
            this._members.properties[propertyName] = options;
        } else {
            log.error(label('addProperty') + propertyName + 'exists already')
            throw new Error('Property' + propertyName + 'exists already')
        } 
    }
    // ReadValue can be sync or async
    protected enableReadValue(readValueFn: () => T , flags: ReadFlag[] = ['read']) {
        this.checkExported('enableReadValue');
        this.addFlags(flags);
        this.addMethod('ReadValue', { inSignature: 'a{sv}', outSignature: 'ay' });
        this._readValueFn = readValueFn.bind(this);
    }
    protected enableAsyncReadValue(readValueFn: () => Promise<T> , flags: ReadFlag[] = ['read']) {
        this.checkExported('enableAsyncReadValue');
        this.addFlags(flags);
        this.addMethod('ReadValue', { inSignature: 'a{sv}', outSignature: 'ay' });
        this._readValueAsync = readValueFn.bind(this);
    }
     // WriteValue can be sync or async
    protected enableWriteValue( writeValueFn: (value: T) => void,
                             isValidFn: (raw: unknown) => boolean, flags: WriteFlag[] = ['write']) {
        this.checkExported('enableWriteValue');
        this.addFlags(flags);
        this.addMethod('WriteValue', { inSignature: 'aya{sv}', outSignature: '' });
        this._writeValueFn = writeValueFn.bind(this);
        this._isValidFn = isValidFn.bind(this);
    }
    protected enableAsyncWriteValue( writeValueFn: (value: T) => Promise<void>,
                             isValidFn: (raw: unknown) => boolean, flags: WriteFlag[] = ['write']) {
        this.checkExported('enableAsyncWriteValue');
        this.addFlags(flags);
        this.addMethod('WriteValue', { inSignature: 'aya{sv}', outSignature: '' });
        this._writeValueAsync = writeValueFn.bind(this);
        this._isValidFn = isValidFn.bind(this);
    }
    protected enableNotify(startNotifyFn: () => void, stopNotifyFn: () => void, flags: NotifyFlag[] = ['notify'] ) {
        this.checkExported('enableNotify');
        this.addFlags(flags);
        this.addMethod('StartNotify', {});
        this.addMethod('StopNotify', {});
        this.addProperty('Value', { signature: 'ay', access: dbus.interface.ACCESS_READ });
        this.addProperty('Notifying', {signature: 'b', access: dbus.interface.ACCESS_READ });
        this._startNotifyFn = startNotifyFn.bind(this);
        this._stopNotifyFn = stopNotifyFn.bind(this);
    }
    // Private class methods
    private checkExported(m: string) {
        log.info(label(m) +'UUID=' + this.UUID);
        if (this._exported) {
            log.error(label(m) +'UUID=' + this.UUID + ' interface members exported already');
            throw new Error('UUID=' + this.UUID + ' interface members exported already');
        } 
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
            log.error(label('convert') + 'NotSupportedDBusError: Write with offset > 0 not supported')
            throw new NotSupportedDBusError('Write with offset > 0 not supported, offset=' +
            offset, constants.GATT_CHARACTERISTIC_INTERFACE);
        }
        const decoded = decode(data);
        log.debug(label('decode') + 'decoded=' + decoded);
        try{
            const raw = JSON.parse(decoded); 
            log.debug(label('decode') + 'raw=' + JSON.stringify(raw));
            if (this._isValidFn(raw)){
                return <T>raw;
            } else {
                throw new FailedException('WriteValue.convert, received invalid data',
                constants.GATT_CHARACTERISTIC_INTERFACE);
            };
        } catch (e){
            log.error('convert. Cannot parse JSON.' + e);
            throw new FailedException('WriteValue.convert, cannot convert value' + e,
            constants.GATT_CHARACTERISTIC_INTERFACE);
        }
    }
}
