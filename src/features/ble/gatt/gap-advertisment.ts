/**  GAP Avdertisment mdoule */
import dbus from 'dbus-next';
import { LEAdvertisingManager1 } from '../bluez/org.bluez-gatt-class';
import * as constants from './gatt-constants';
import { log } from '../../../core/logger';
import { DbusMembers } from './gatt-utils';

type AdvertisingType = 'broadcast' | 'peripheral';
const m = "gap-advertisment"

function label(f: string = ""){
    return m + "." + f + ": ";
} 
export interface ServiceDataDict{
   [uuid: string]: Buffer; 
}
export interface ManufacturerDataDict{
    [ManufacturerID: number]: Buffer; 
 }
/**  Use class Adertisement for ardvertising your GATT service 
 *   hierachi through DBus.
 */
 export class Adertisement extends dbus.interface.Interface {
    _serviceUUIDs: string [] = [];
    _manufacturerData: ManufacturerDataDict = {} ;
    _solicitUUIDs: string [] = [];
    _serviceData: ServiceDataDict = {};
    _localName: string= '';
    _path: string = '';
    _discoverable: boolean = false;
    _includes: string[] = []; 
    _isAdvertising: boolean = false;
    /** Create an advertisment
     * @param path - Domain name, e.g. 'com.example'
     * @param index - index added to the end of the path
     * @param includeTxPower - set to true (default) to include TxPower feature
     * @param AdvertisingType -  'peripheral' (default) or 'Broadcast' 
     */
    constructor(path: string,
                index: number = 0,
                private _advertisingType: AdvertisingType = 'peripheral',
                private _appearance: number = constants.apperance.IoTGateway,
                private _includeTxPower: boolean = true,
                private _bus: dbus.MessageBus = constants.systemBus,
        ) {
        super(constants.ADVERTISEMENT_INTERFACE);
        this._path = path + '/advertisment' + index;
        if (this._includeTxPower) {
            this.include('tx-power');
        }
    }
    /** Add a service to tthe ServiceUUID properpty
     * 
     * @param uuid - Service UUID
     */
    public addServiceUUID(uuid: string): void {
        this._serviceUUIDs.push(uuid);
        log.info(label("addServiceUUID") + "UUID=" + uuid);
    }
    /** Set the local name to be advertised.
     * @param name - The name of the service in the advertisement 
     */
    public setLocalName(name: string): void {
        this._localName = name;
        log.info(label("setLocalName") + "LocalName=" + name);
    }
    /** Call init to setup advertisement of the services to the clients */
    public async init(): Promise<void> {
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
                Appearance: {
                    signature: 'q',
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
        
        if (this.ServiceUUIDs.length > 0 && members.properties) {
            members.properties['ServiceUUIDs'] = {
                signature: 'as',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this.SolicitUUIDs.length > 0 && members.properties) {
            members.properties['SolicitUUIDs'] = {
                signature: 'as',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this.ManufacturerData !== {}  && members.properties) {
            members.properties['ManufacturerData'] = {
                signature: 'a{qv}',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this.ServiceData !== {}  && members.properties) {
            members.properties['ServiceData'] = {
                signature: 'a{say}',
                access: dbus.interface.ACCESS_READ,
            };
        }
        if (this.Includes.length > 0 && members.properties) {
            members.properties['Includes'] = {
                signature: 'as',
                access: dbus.interface.ACCESS_READ,
            };
        }
        try{
            Adertisement.configureMembers(members);
            this._bus.export(this._path, this);
            log.info(label("publish") + constants.ADVERTISEMENT_INTERFACE + ' exported on path ' +  this._path);
        } catch (e){
            log.error(label("publish") + "Export Adertisement, error=" + JSON.stringify(e));
        }
    }
    async register(){
        try {
            const adapterPath = constants.BLUEZ_NAMESPACE + constants.ADAPTER_NAME;
            this._discoverable = true;
            // const objectManager = await OrgfreedesktopDBusObjectManager.Connect(this._bus);
            // const managedObjects = await objectManager.GetManagedObjects();
            // log.info(label("publish") + "managedObjects=" + JSON.stringify(managedObjects));
            const advertisingManager = await LEAdvertisingManager1.Connect(constants.systemBus, adapterPath)
            await advertisingManager.RegisterAdvertisement(this._path, {});
            this._isAdvertising = true;
            log.info(label("register") + "Registered Advertisement, path=" + this._path);
        } catch(e){
            log.error(label("register") + "Register Advertisement, error=" + JSON.stringify(e));
            this._isAdvertising = false;
        }
    } 
    async unregister(){
        try {
            const adapterPath = constants.BLUEZ_NAMESPACE + constants.ADAPTER_NAME;
            this._discoverable = false;
            const advertisingManager = await LEAdvertisingManager1.Connect(constants.systemBus, adapterPath)
            await advertisingManager.UnregisterAdvertisement(this._path);
            this._isAdvertising = false;
            log.info(label("unregister") + "Unregistered Adertisement, path=" + this._path);
        } catch(e){
            log.error(label("unregister") + "Unregister Adertisement, error=" + JSON.stringify(e));
        }
    } 
    public get Type(): AdvertisingType {
        return this._advertisingType;
    }
    public get ServiceUUIDs(): string[] {
        return this._serviceUUIDs;
    }
    public get ManufacturerData(): ManufacturerDataDict {
        return this._manufacturerData;
    }
    public get SolicitUUIDs(): string[] {
        return this._solicitUUIDs;
    }
    public get ServiceData(): ServiceDataDict {
        return this._serviceData;
    }
    public get LocalName(): string {
        return this._localName;
    }
    public get Appearance(): number {
        return this._appearance;
    }
    public get Discoverable(): boolean {
        return this._discoverable;
    }
    public get Includes(): string[] {
        return this._includes;
    }
    private include(feature: string): void {
        this._includes.push(feature);
    }
    public async Release(): Promise<void> {
        log.info(label('Release'));
        await this.unregister();
        await this.register();
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
