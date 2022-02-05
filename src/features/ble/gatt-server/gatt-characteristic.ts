import dbus from 'dbus-next';
import * as constants from './gatt-constants';
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
type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};
export class Characteristic extends dbus.interface.Interface implements GATTCharacteristic1  {
    _path: string = '';
    _descriptors: Descriptor[] =[];
    _descriptorIndex = 0;
    constructor(
                private uuid: string,
                private flags: FlagArray,
                private service: Service,
                private bus: dbus.MessageBus = dbus.systemBus()) {
        super(constants.GATT_CHARACTERISTIC_INTERFACE);
        this.service.addCharacteristic(this);
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
            Service: this.Service,
            UUID: this.UUID,
            Flags: this.Flags,
            Descriptors: [],
        };
        return properties;
    }
    public publish(): void {
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
                    signature: 'a{ss}',
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
                },
                StartNotify: {
                    inSignature: '',
                },
                StopNotify: {
                    inSignature: '',
                },
            },
        };
        dbus.interface.Interface.configureMembers(members);
        this.bus.export(this.getPath(), this);
        this._descriptors.forEach((desc) => desc.publish());
        // const signalMembers: DbusMembers = {
        //     signals: {
        //         PropertiesChanged: {
        //             signature: 'sa{sv}as',
        //         },
        //     },
        // };
        // this._dbusIface = new dbus.interface.Interface(constants.DBUS_PROP_IFACE);
        // dbus.interface.Interface.configureMembers(signalMembers);
    }
    // Properties of org.freedesktop.DBus.Properties.Get | GetAll
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
    // Methods of the GATTCharacteristic1 interface
    protected ReadValue(): Buffer {
        throw Error();
    }
    protected WriteValue(value: Buffer): void {
        throw Error(value.toString());
    }
    protected StartNotify(): void {
        throw Error();
    }
    protected StopNotify(): void {
        throw Error();
    }
}