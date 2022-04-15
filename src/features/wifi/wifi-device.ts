import { profile } from 'console';
import dbus from 'dbus-next'; 
import { resolve } from 'dns';
import { v4 as uuid } from 'uuid';

import { getBus } from  '../../core/dbus';
import { decode, stringify } from  '../../core/helpers';
import { log as wLog } from '../../core/logger';

import { NetworkManager } from './dbus/generated/org.freedesktop.NetworkManager-class';
import { AccessPoint } from './dbus/generated/org.freedesktop.NetworkManager.ap-class'; 
import { Settings } from './dbus/generated/org.freedesktop.NetworkManager.settings-class'; 
import { Device, DeviceWireless, OrgfreedesktopDBusProperties } from './dbus/generated/org.freedesktop.NetworkManager.wireless-class';


class StrVariant extends dbus.Variant<string> {
    constructor(value: string) {
        super('s', value);
    } 
}
class BoolVariant extends dbus.Variant<boolean> {
    constructor(value: boolean) {
        super('b', value);
    } 
}
class ByteArrayVariant extends dbus.Variant<Buffer> {
    constructor(value: Buffer) {
        super('ay', value);
    } 
}
interface Dict {
    [key: string]: dbus.Variant; 
}
interface DictofDict {
   [key: string]: Dict; 
} 
interface ConnectionProfile {
    'connection': Dict;
    '802-11-wireless': Dict;
    '802-11-wireless-security': Dict;
    'ipv4': Dict;
    'ipv6': Dict;
}
export interface AccessPointData {
    ssid: string;
    security: string;
    quality: number;
    channel: number;
    lastSeen: number
}
export interface AccessPointDict {
   [ssid: string]: AccessPointData;
} 
interface SecurityTypes {
   [code: string]: number;
} 

const AP_802_11S: SecurityTypes = {
    /** Access point has no special capabilities */
    NONE: 0x00000000,
    /** Access point requires authentication and encryption (usually means WEP) */
    PRIVACY: 0x00000001,
    /** Access point supports some WPS method */
    WPS: 0x00000002,
    /** Access point supports push-button WPS */
    WPS_PBC: 0x00000004,
    /** Access point supports PIN-based WPS */
    WPS_PIN: 0x00000008,
};

/**
 * NM80211ApSecurityFlags
 * @enum {Number}
 * @description current security requirements of an
 * access point as determined from the access point's beacon
 */
const AP_802_11_SEC: SecurityTypes = {
    /** The access point has no special security requirements */
    NONE: 0x00000000,
    /** 40/64-bit WEP is supported for pairwise/unicast encryption */
    PAIR_WEP40: 0x00000001,
    /** 104/128-bit WEP is supported for pairwise/unicast encryption */
    PAIR_WEP104: 0x00000002,
    /** TKIP is supported for pairwise/unicast encryption */
    PAIR_TKIP: 0x00000004,
    /** AES/CCMP is supported for pairwise/unicast encryption */
    PAIR_CCMP: 0x00000008,
    /** 40/64-bit WEP is supported for group/broadcast encryption */
    GROUP_WEP40: 0x00000010,
    /** 104/128-bit WEP is supported for group/broadcast encryption */
    GROUP_WEP104: 0x00000020,
    /** TKIP is supported for group/broadcast encryption */
    GROUP_TKIP: 0x00000040,
    /** AES/CCMP is supported for group/broadcast encryption */
    GROUP_CCMP: 0x00000080,
    /** WPA/RSN Pre-Shared Key encryption is supported */
    KEY_MGMT_PSK: 0x00000100,
    /** 802.1x authentication and key management is supported */
    KEY_MGMT_802_1X: 0x00000200,
};
export class WiFiDevice {
    // Interfaces
    private _nm: NetworkManager;
    private _settings: Settings;
    private _deviceWireless: DeviceWireless;
    private _properties: OrgfreedesktopDBusProperties;


    //  properties
    private _connectionPath: dbus.ObjectPath = '';
    private _iface: string = '';
    private _devicePath: string = '';
    private _lastTime = -1;
    private _uuid: string = '';
    private availableAPs: AccessPointDict = {}; 

    constructor(
        private _bus: dbus.MessageBus = getBus()) {
    }
    public async init(): Promise<void>{
        await this.connectNM();
        await this.connectSettings();
        await this.connectDeviceWireless();
        await this.connectProperties();
    } 
    public async GetAllAccessPoints(): Promise<AccessPointDict>{
        this.availableAPs = {}; 
        await this.scan();
        const paths = await this._deviceWireless.GetAllAccessPoints();
        wLog.info('GetAllAccessPoints: GetAllAccessPoints path=' + JSON.stringify(paths));
        for (const path of paths){
            const apProxy = await this._bus.getProxyObject('org.freedesktop.NetworkManager', path);
            const propsIface = await apProxy.getInterface('org.freedesktop.DBus.Properties');
            const props = await propsIface.GetAll('org.freedesktop.NetworkManager.AccessPoint');
            this.addAccessPoint(props);
        }
        return this.availableAPs; 
    }
    public async getCurrentNetwork(): Promise<string> {
        const activeConnections = await this._nm.ActiveConnections();
        const ActiveIface = 'org.freedesktop.NetworkManager.Connection.Active';
        for (const activeConnection of activeConnections) {
            const activeProps = await this.getProperties(activeConnection, ActiveIface,['Type', 'Connection']);
            if (activeProps.Type.value === '802-11-wireless') {
                const settings = await this.getSettings(activeProps.Connection.value);
                const wifiSettings = settings['802-11-wireless'];
                const currentNetwork = decode(wifiSettings['ssid'].value).replace('"', '');
                wLog.info('getCurrentNetwork, currentNetwork=' + currentNetwork)
                return currentNetwork; 
            } 
        }
        throw new Error('No wireless network found')
    }
    public async connectNetwork (ssid: string,  password: string):Promise<void> {
        wLog.info('wifiDevice.connectNetwork, ssid=' + ssid + ', password=' + password.replace(/.*/, '*'));
        // require a nearby AP
        this.GetAllAccessPoints().then((nearbyAPs) => { 
            if (!(ssid in nearbyAPs)) {
                throw new Error('Network not available')
            } 
        })
        .catch((e) => wLog.error('wifiDevice.connectNetwork: GetAllAccessPoints error' + e));
        // Check if connection has been added already, add otherwise.
        this._connectionPath = await this.findWiFiConnection(ssid);
        if (this._connectionPath.length === 0 ) {
            this._connectionPath = await this._settings.AddConnection(this.createprofile(ssid, password));
            wLog.info('wifiDevice.connectNetwork: added connection=' + this._connectionPath);
        } else {
            wLog.info('wifiDevice.addConnection: re-using existing connection=' + this._connectionPath);
        } 
        //Activiate connection
        if (this._connectionPath.length > 0) {
            const path = await this._nm.ActivateConnection(this._connectionPath, '/', '/');
        } else {
            wLog.error('wifiDevice.connectNetwork, no wireless connection to activate')
        } 

    }
    private async findWiFiConnection(ssid: string): Promise<string> {
        const connections = await this._settings.ListConnections();
        const toString = (setting: DictofDict): string => { const keys =[]; for (const key in setting){keys.push(key)} return keys.toString() } 
        for (const connection of connections) {
            const settings = await this.getSettings(connection);
            wLog.warn('findWiFiConnection, settings=' + toString(settings));
            if ('802-11-wireless' in settings) {
                wLog.warn('findWiFiConnection, settings=' + stringify(settings['802-11-wireless'] ));
                if (ssid === settings['802-11-wireless'].ssid.value.toString()) {
                return connection;
            }} 
        } 
        return '';
    } 
    private async getSettings(connection: string):Promise<DictofDict> {
        const SettingsIface = 'org.freedesktop.NetworkManager.Settings.Connection';
        const apProxy = await this._bus.getProxyObject('org.freedesktop.NetworkManager', connection);
        const settingsIface = await apProxy.getInterface(SettingsIface);
        return await settingsIface.GetSettings();
    } 
    private async scan(): Promise<void> {
        const scanningOptions = {}; 
        return new Promise((resolve) => {
            this._properties.on('PropertiesChanged', (interface_name: string, changed_properties: {[key: string]: dbus.Variant<any>; }) => {
                if (interface_name === this._deviceWireless.dbusInterfaceName) {
                    for (const key in changed_properties) {
                        if (key === 'LastTime' && changed_properties [key].value > this._lastTime ) {
                            this._lastTime = changed_properties [key].value;
                            wLog.info('wifiDevice.scan: Scanning completed, lastTime=' + this._lastTime);    
                            resolve();
                        } 
                    }
                }
            });
            this._deviceWireless.RequestScan(scanningOptions)
            .then(() => wLog.info('wifiDevice.scan: Scanning requested'))
            .catch((e) =>  wLog.error('wifiDevice.scan: RequestScan error=' + e));
            setInterval(() => resolve(), 16000);
        });
    }
    private async getAllDevicePaths(): Promise<string[]> {
        await this.connectNM();
        return await this._nm.AllDevices();
    } 
    private addAccessPoint(dict: Dict) {
        if ('Ssid' in dict && 'Frequency' in dict && 'Strength' in dict && 
        'Flags' in dict && 'WpaFlags' in dict && 'RsnFlags' in dict && 'LastSeen' in dict){
            const ap = {
                ssid: decode(dict['Ssid'].value),
                channel: this.toChannel(dict['Frequency'].value as number),
                quality:  dict['Strength'].value,
                security: this.security(dict['Flags'].value, dict['WpaFlags'].value,dict['RsnFlags'].value,),
                lastSeen: dict['LastSeen'].value
            }
            if (!(ap.ssid in this.availableAPs) || ap.lastSeen > this.availableAPs[ap.ssid].lastSeen ){
                this.availableAPs[ap.ssid] = ap;
            }
        } else {
            throw Error ('Cannot convert Access Point properties');
        } 

    }
    private toChannel(frequency: number): number {
        return frequency > 2400 
        ? 36
        : 1;
    }
    private getSecurityCodes(securityTypes: SecurityTypes, value: number): string[] {
        const codes = [];
        for (const key in securityTypes){
            if (securityTypes[key] & value){
                codes.push(key)
            } 
        }
        return codes
    }
    private security(Flags: number,  WpaFlags: number, RsnFlags: number) {
        const flagSecurity = this.getSecurityCodes(AP_802_11S, Flags);
        const wpaSecurity = this.getSecurityCodes(AP_802_11_SEC, WpaFlags);
        const rsnSecurity = this.getSecurityCodes(AP_802_11_SEC, RsnFlags);
        let security = 'Open';
        if (flagSecurity.indexOf('PRIVACY') !== -1 && wpaSecurity.length == 0 && rsnSecurity.length === 0) {
            security = 'WEP';
        }
        if (wpaSecurity.length > 0) {
            security = 'WPA'
        }
        if (rsnSecurity.length > 0) {
            security = 'WPA2'
        }
        if (wpaSecurity.indexOf('KEY_MGMT_802_1X') !== -1 || rsnSecurity.indexOf('KEY_MGMT_802_1X') !== -1) {
            security = 'enterprise'
        } 
        return security;
    }
    private createprofile(ssid: string,  password: string): ConnectionProfile {
        if (this._uuid.length === 0) {
            this._uuid = uuid();
        }   
        const profile = {
            'connection': {
                'type': new dbus.Variant('s', '802-11-wireless'),
                'uuid': new dbus.Variant('s', this._uuid),
                'id': new dbus.Variant('s', ssid),
            },
            '802-11-wireless':  {
                'ssid': new dbus.Variant('ay',Buffer.from(ssid)),
                'id': new dbus.Variant('s', 'infrastructure'),
            },
            '802-11-wireless-security': {
                'key-mgmt': new dbus.Variant('s', 'wpa-psk'),
               'auth-alg': new dbus.Variant('s','open'),
                'psk': new dbus.Variant('s', password)
            },
            'ipv4':  {
                'method':new dbus.Variant('s','auto'),
            },
            'ipv6':  {
                'method': new dbus.Variant('s','auto'),
            },
        };
        wLog.debug('wifiDevice.createProfile: profile=' + stringify(profile,2));
        return profile
    }
    private async getAllProperties (path: string, iface: string): Promise<any> {
        const apProxy = await this._bus.getProxyObject('org.freedesktop.NetworkManager', path);
        const propsIface = await apProxy.getInterface('org.freedesktop.DBus.Properties');
        return await propsIface.GetAll(iface);
    }
    private async getProperties (path: string, iface: string, properties: string [] ): Promise<Dict> {
        const result: Dict = {}; 
        const apProxy = await this._bus.getProxyObject('org.freedesktop.NetworkManager', path);
        const propsIface = await apProxy.getInterface('org.freedesktop.DBus.Properties');
        for (const property of properties) {
            result[property] = await propsIface.Get(iface, property);
        } 
        return result;
    }
    private async connectNM(): Promise<void>{
        if (!this._nm){
            this._nm = await NetworkManager.Connect(this._bus);
            wLog.info('wifiDevice.connectNM, NetWorkManager connected');
        } 
    }
    public async connectSettings(): Promise<void> {
        if (!this._settings){
            this._settings = await Settings.Connect(this._bus);
            wLog.info('wifiDevice.connectSettings, Settings connected');
        } 
    }
    private async connectDeviceWireless(): Promise<void> {
        if (this._devicePath.length === 0 ||  !this._deviceWireless) {
            await this.findWiFiDevice();
            this._deviceWireless = await DeviceWireless.Connect(this._bus, this._devicePath);
            wLog.info('wifiDevice.connectDeviceWireless, DeviceWireless connected');
        }  
    }
    private async findWiFiDevice(): Promise<void> {
        const allDevicePaths = await this.getAllDevicePaths();
        wLog.info('wifiDevice.findWiFiDevice, allDevicePaths=' + JSON.stringify(allDevicePaths));
        for (const devicePath of allDevicePaths){
            const device = await Device.Connect(this._bus, devicePath);
            const deviceType = await device.DeviceType();
            if (deviceType === 2) {
                wLog.info('wifiDevice.findWiFiDevice, wifi device found path=' + devicePath);
                this._devicePath = devicePath;
                return;
            }
        } 
        throw new Error('Wireless device not found');
    } 
    private async connectProperties(): Promise<void> {
        if (!this._properties){
            this._properties = await OrgfreedesktopDBusProperties.Connect(this._bus, this._devicePath);
            wLog.info('wifiDevice.connectProperties: OrgfreedesktopDBusProperties connected');
        } 
    } 
}
