import dbus from 'dbus-next';
import * as constants from './gatt-constants';

import { DbusMembers } from './gatt-utils';

type AdvertisingType = 'broadcast' | 'peripheral';

export class Adertisement extends dbus.interface.Interface {
    _serviceUUIDs: string [] = [];
    _manufacturerData: Buffer;
    _solicitUUIDs: string [] = [];
    _serviceData: Buffer;
    _localName: string= '';
    _data: Buffer;
    _path: string = '';
    constructor(path: string,
                index: number = 0,
                private _includeTYxPower: boolean = false,
                private _advertisingType: AdvertisingType = 'peripheral',
                private _bus: dbus.MessageBus = dbus.systemBus(),
        ) {
        super(constants.ADVERTISEMENT_INTERFACE);
        this._path = path + '/adverisment' + index;
    }
    public addServiceUUID(uuid: string): void {
        this._serviceUUIDs.push(uuid);
    }
    public setLocalName(name: string): void {
        this._localName = name;
    }
    public publish(): void {
        const members: DbusMembers  = {
            properties: {
                Type: {
                    signature: 's',
                    access: dbus.interface.ACCESS_READ,
                },
                LocalName: {
                    signature: 's',
                    access: dbus.interface.ACCESS_READ,
                },
            },
            methods: {
                Release: {
                    inSignature: '',
                    outSignature: '',
                },
            },
        };
        // TODO: Add and test this:
        //
        // if (this._serviceUUIDs !== [] && members.properties) {
        //     members.properties['ServiceUUIDs'] = {
        //         signature: 'as',
        //         access: dbus.interface.ACCESS_READ,
        //     };
        // }
        // if (this._solicitUUIDs !== [] && members.properties) {
        //     members.properties['SolicitUUIDs'] = {
        //         signature: 'as',
        //         access: dbus.interface.ACCESS_READ,
        //     };
        // }
        // if (this._manufacturerData && members.properties) {
        //     members.properties['ManufacturerData'] = {
        //         signature: 'a{qv}',
        //         access: dbus.interface.ACCESS_READ,
        //     };
        // }
        // if (this._serviceData && members.properties) {
        //     members.properties['ServiceData'] = {
        //         signature: 'a{sv}',
        //         access: dbus.interface.ACCESS_READ,
        //     };
        // }
        // if (this._includeTYxPower && members.properties) {
        //     members.properties['Includes'] = {
        //         signature: 'as',
        //         access: dbus.interface.ACCESS_READ,
        //     };
        // }
        // if (this._data && members.properties) {
        //     members.properties['ServiceData'] = {
        //         signature: 'a{yv}',
        //         access: dbus.interface.ACCESS_READ,
        //     };
        // }
        dbus.interface.Interface.configureMembers(members);
        this._bus.export(this.getPath(), this);
    }
    public get Type(): AdvertisingType {
        return this._advertisingType;
    }
    public get ServiceUUIDs(): string[] {
        return this._serviceUUIDs;
    }
    public get SolicitUUIDs(): string[] {
        return this._solicitUUIDs;
    }
    public get ManufacturerData(): Buffer {
        return this._manufacturerData;
    }
    public get ServiceData(): Buffer {
        return this._serviceData;
    }
    public get LocalName(): string {
        return this._localName;
    }
    public get Includes(): string[] {
        const includes: string[] = [];
        if (this._includeTYxPower) {
            includes.push('tx-power');
        }
        return includes;
    }
    public get Data(): string[] {
        const includes: string[] = [];
        if (this._includeTYxPower) {
            includes.push('tx-power');
        }
        return includes;
    }
    public Release() {
        // Nothing to do
    }
    public getPath(): string {
        return this._path;
    }
    public setPath(path: string) {
        this._path = path;
    }
}
