import dbus from 'dbus-next';
import * as constants from './gatt-constants';
import { log } from '../../../core/logger';
import { DbusMembers } from './gatt-utils';

type AdvertisingType = 'broadcast' | 'peripheral';
const m = "gap-advertisment"
function label(f: string = ""){
    return m + "." + f + ": ";
} 
export class Adertisement extends dbus.interface.Interface {
    _serviceUUIDs: string [] = [];
    _manufacturerData: Buffer;
    _solicitUUIDs: string [] = [];
    _serviceData: Buffer;
    _localName: string= '';
    _data: Buffer;
    _path: string = '';
    _discoverable: boolean = false;
    _isAdvertising: boolean = false;
    constructor(path: string,
                index: number = 0,
                private _includeTYxPower: boolean = false,
                private _advertisingType: AdvertisingType = 'peripheral',
                private _bus: dbus.MessageBus = constants.systemBus,
        ) {
        super(constants.ADVERTISEMENT_INTERFACE);
        this._path = path + '/adverisment' + index;
    }
    public addServiceUUID(uuid: string): void {
        this._serviceUUIDs.push(uuid);
        log.info(label("addServiceUUID") + "UUID=" + uuid);
    }
    public setLocalName(name: string): void {
        this._localName = name;
        log.info(label("setLocalName") + "LocalName=" + name);
    }
    public async publish(): Promise<void> {
        const bus = constants.systemBus;
        const adapterPath = constants.BLUEZ_NAMESPACE + constants.ADAPTER_NAME;
        this._discoverable = true;
        try {
            const advertisingManagerObject = await this._bus.getProxyObject(constants.BLUEZ_SERVICE_NAME, adapterPath);
            const advertisingmanager =  advertisingManagerObject.getInterface(constants.GATT_MANAGER_INTERFACE);
            advertisingmanager.on('message', (msg) =>{
                log.info(label("publish.on.") + "Received message=" + JSON.stringify(msg));
            } );
            await advertisingmanager.RegisterApplication(this._path,{});
            log.info(label("publish") + "Registered application, path=" + this._path);
        } catch(e){
            log.error(label("publish") + "Registered application, error=" + JSON.stringify(e));
        } 

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
                Discoverable: {
                    signature: 'b',
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
        
        if (this._serviceUUIDs !== [] && members.properties) {
            members.properties['ServiceUUIDs'] = {
                signature: 'as',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this._solicitUUIDs !== [] && members.properties) {
            members.properties['SolicitUUIDs'] = {
                signature: 'as',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this._manufacturerData && members.properties) {
            members.properties['ManufacturerData'] = {
                signature: 'a{qv}',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this._serviceData && members.properties) {
            members.properties['ServiceData'] = {
                signature: 'a{sv}',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this._discoverable && members.properties) {
            members.properties['ServiceData'] = {
                signature: 'a{sv}',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this._includeTYxPower && members.properties) {
            members.properties['Includes'] = {
                signature: 'as',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this._data && members.properties) {
            members.properties['ServiceData'] = {
                signature: 'a{yv}',
                access: dbus.interface.ACCESS_READ,
            };
        }
        try{
            Adertisement.configureMembers(members);
            this._bus.export(this.getPath(), this);
            this._isAdvertising = true;
            log.info(label("publish") + "Export Adertisement, members=" + JSON.stringify(members));
        } catch (e){
            log.error(label("publish") + "Export Adertisement, error=" + JSON.stringify(e));
        } 

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
    public get Discoverable(): boolean {
        return this._discoverable;
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
    public isAdvertising(): boolean {
        return this._isAdvertising;
    } 
}
