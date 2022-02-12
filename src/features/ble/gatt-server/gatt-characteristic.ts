import dbus from 'dbus-next';
import * as constants from './gatt-constants';
import { Descriptor } from './gatt-descriptor';
import { Service } from './gatt-service';
import { DbusMembers } from './gatt-utils';

type Flag = 'read' | 'write' | 'notify';
type FlagArray = Flag[];

export interface Properties {
    Service: dbus.Variant<dbus.ObjectPath>;
    UUID: dbus.Variant<string>;
    Flags: dbus.Variant<FlagArray>;
    Descriptors: dbus.Variant<dbus.ObjectPath[]>;
}
export interface Dict {
    [iface: string]: Properties;
}
export interface GATTCharacteristic1 {
    addDescriptor(descriptor: Descriptor): void;
    getDescriptors(): Descriptor[];
    getPath(): string;
    getProperties(): Dict;
    publish(): void;
}
class NotSupportedDBusError extends dbus.DBusError {
    constructor(public text: string) {
        super('org.bluez.Error.NotSupported', constants.GATT_CHARACTERISTIC_INTERFACE + ': ' + text);
    }
}
type ReadValueFn = () => Buffer;
export class Characteristic extends dbus.interface.Interface implements GATTCharacteristic1  {
    _path: string = '';
    _descriptors: Descriptor[] =[];
    _descriptorIndex = 0;
    _readValueFn: ReadValueFn;
    self: Characteristic;
    constructor(
                protected _uuid: string,
                protected _flags: FlagArray,
                protected _service: Service,
                protected _bus: dbus.MessageBus = constants.systemBus) {
        super(constants.GATT_CHARACTERISTIC_INTERFACE);
        this.self = this;
        this._service.addCharacteristic(this);
    }

    public addDescriptor(descriptor: Descriptor): void {
        descriptor.setPath(this.getPath() + '/desc' + this._descriptorIndex++);
        this._descriptors.push(descriptor);
    }
    public getDescriptors(): Descriptor[] {
        return this._descriptors;
    }
    public getPath(): string {
        return this._path;
    }
    public setPath(path: string): void {
        this._path = path;
    }
    public getProperties(): Dict {
        const properties: Dict  = {};
        properties[constants.GATT_CHARACTERISTIC_INTERFACE] =  {
            Service: new dbus.Variant<dbus.ObjectPath>('o', this.Service),
            UUID: new dbus.Variant<string>('s', this.UUID),
            Flags: new dbus.Variant<FlagArray>('as', this.Flags),
            Descriptors: new dbus.Variant<dbus.ObjectPath[]>('ao', this.Descriptors),
        };
        return properties;
    }
    public publish(): void {
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
                    inSignature: '',
                    outSignature: 'ay',
                },
                WriteValue: {
                    inSignature: 'ay',
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
        this._bus.export(this.getPath(), this.self);
        this._descriptors.forEach(desc => desc.publish());
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
    // Methods of the GATTCharacteristic1 interface
    public overrideReadValue(fn: ReadValueFn) {
        this._readValueFn = fn;
    }
    protected ReadValue(): Buffer {
        if (this._readValueFn !== undefined) {
            return this._readValueFn();
        } else {
            throw new NotSupportedDBusError('ReadValue');
        }
    }
    protected WriteValue(value: Buffer): void {
        throw new NotSupportedDBusError('WriteValue, value=: ' + value.toString());
    }
    protected StartNotify(): void {
        throw new NotSupportedDBusError('StartNotify');
    }
    protected StopNotify(): void {
        throw new NotSupportedDBusError('StopNotify');
    }
}
