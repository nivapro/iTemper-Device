import dbus from 'dbus-next'; 
import { resolve } from 'dns';
import { v4 as uuid } from 'uuid';

import { getBus } from  '../../core/dbus';
import { decode } from  '../../core/helpers';
import { wLog } from '../../core/logger';

import { NetworkManager } from './dbus/generated/org.freedesktop.NetworkManager-class';
import { AccessPoint } from './dbus/generated/org.freedesktop.NetworkManager.ap-class'; 
import { Settings } from './dbus/generated/org.freedesktop.NetworkManager.settings-class'; 
import { Device, DeviceWireless, OrgfreedesktopDBusProperties } from './dbus/generated/org.freedesktop.NetworkManager.wireless-class';


class StrVariant extends dbus.Variant<string> {
    constructor(public value: string) {
        super('s', value);
    } 
}
class BoolVariant extends dbus.Variant<boolean> {
    constructor(public value: boolean) {
        super('s', value);
    } 
}
class ByteArrayVariant extends dbus.Variant<Buffer> {
    constructor(public value: Buffer) {
        super('ay', value);
    } 
}
interface Dict {
    [key: string]: dbus.Variant; 
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
}
export class WiFi {
    // Interfaces
    _nm: NetworkManager;
    _device: Device;
    _deviceWireless: DeviceWireless;
    _properties: OrgfreedesktopDBusProperties;
    _settings: Settings;

    //  properties
    _connectionPath: dbus.ObjectPath = '';
    _iface: string = '';
    _devicePath: string = '';
    _lastTime = -1;
    _uuid: string = '';

    constructor(
        private _bus: dbus.MessageBus = getBus()) {
    }
    public async Scan(): Promise<AccessPointData[]>{
        const availableAPs: AccessPointData[] = [];

        await this.requestScan();
        wLog.info(', Scan: request scan done')
        const paths = await this._deviceWireless.GetAllAccessPoints();
        wLog.info(', Scan: GetAllAccessPoints done')
        for (const path in paths){
            const ap = await OrgfreedesktopDBusProperties.Connect(this._bus, path);
            const props = await ap.GetAll('org.freedesktop.NetworkManager.AccessPoint');
            availableAPs.push(this.toAccessPointData(props));
        }
        wLog.info(', Scan: availableAPs=' + JSON.stringify(availableAPs));
        return availableAPs; 
    }
    private toChannel(frequency: number): number{
        return frequency > 2400 
        ? 36
        : 1;
    } 
    private toAccessPointData(dict: Dict): AccessPointData {
        wLog.info(', toAccessPointData: dict=' + JSON.stringify(dict));
        if ('Ssid' in dict && 'Frequency' in dict && 'Strength' in dict){
            return {
                ssid: decode(dict['Ssid'].value),
                channel: this.toChannel(dict['Frequency'].value as number),
                quality:  dict['Strength'].value,
                security: 'WPA2'
            }
        } 
        throw Error ('Cannot convert Access Point properties');
    } 
    private async requestScan(): Promise<void>{
        const options = {}; 
        await this.connectDeviceWireless();
        await this._deviceWireless.RequestScan(options);

        await this.connectProperties();
        return new Promise((resolve) => {
            this._properties.on('PropertiesChanged', (interface_name: string,
                                                            changed_properties: { [key: string]: dbus.Variant<any>; } ) => {
                wLog.info(', requestScan: PropertiesChanged=' + JSON.stringify(changed_properties));
                if (interface_name === this._deviceWireless.dbusInterfaceName) {
                    for (const key in changed_properties) {
                        if (key === 'LastTime' && changed_properties [key].value !== this._lastTime ){
                            this._lastTime = changed_properties [key].value;
                            wLog.info(', requestScan: lastTime=' + this._lastTime);    
                            resolve();
                        } 
                    }
                }
            })
        });
    } 
    public async AddConnection (ssid: string,  password: string) {
        await this.connectSettings();
        if (this._connectionPath.length === 0 ){
            this._connectionPath = await this._settings.AddConnection(this.createprofile(ssid, password));
        }
        const path = await this._nm.ActivateConnection(this._connectionPath, '/', '/');
    }
    private createprofile(ssid: string,  password: string): ConnectionProfile {
        if (this._uuid.length === 0) {
            this._uuid = uuid();
        }   
        return {
            'connection': {
                type: new StrVariant('802-11-wireless'),
                uuid: new StrVariant(this._uuid),
                id: new StrVariant(ssid)
            },
            '802-11-wireless':  {
                ssid: new ByteArrayVariant(Buffer.from(ssid)),
                mode: new StrVariant('infrastructure'),
                hidden: new BoolVariant(true)
            },
            '802-11-wireless-security': {
               'key-mgmt': new StrVariant('wpa-psk'),
               'auth-alg': new StrVariant('open'),
                psk: new StrVariant(password)
            },
            'ipv4':  {
                method: new StrVariant('auto'),
            },
            'ipv6':  {
                method: new StrVariant('auto'),
            },
        }; 
    }
    private async connectSettings(){
        if (!this._settings){
            this._settings = await Settings.Connect(this._bus);
        } 
    }
    private async connectNM(){
        if (!this._nm){
            this._nm = await NetworkManager.Connect(this._bus);
        } 
    }
    private async getAllDevicePaths(): Promise<string[]> {
        await this.connectNM();
        return await this._nm.AllDevices();
    } 
    private async connectDevice(): Promise<void> {
        const allDevicePaths = await this.getAllDevicePaths();
        for (const devicePath of allDevicePaths){
            const device = await Device.Connect(this._bus, devicePath);
            const deviceType = await device.DeviceType();
            if (deviceType === 2) {
                this._devicePath = devicePath;
                this._device = device;
                this._deviceWireless = await DeviceWireless.Connect(this._bus, this._devicePath);
                return;
            }
        } 
        throw new Error('Wireless device not found');
    } 
    private async connectDeviceWireless() {
        if (this._devicePath.length === 0||  !this._deviceWireless) {
            this.connectDevice();
        }  

    }
    private async connectProperties() {  
        if (!this._properties){
            this._properties = await OrgfreedesktopDBusProperties.Connect(this._bus, this._devicePath);
        } 
    } 
} 