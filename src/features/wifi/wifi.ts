import dbus from 'dbus-next'; 
import { v4 as uuid } from 'uuid';

import { getBus } from  '../../core/dbus'

import{ NetworkManager } from './dbus/generated/org.freedesktop.NetworkManager-class';
import { Settings } from './dbus/generated/org.freedesktop.NetworkManager.settings-class'; 


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
export class WiFi {
    _nmSettings: Settings;
    _nm: NetworkManager;
    _objectPath: dbus.ObjectPath = '';

    constructor(
        private _bus: dbus.MessageBus = getBus()) {
    }
    async AddConnection (ssid: string,  password: string) {
        await this.connectNMSettings();
        this._objectPath = await this._nmSettings.AddConnection(this.createprofile(ssid, password));
    } 
    public async onAP(){
        await this.connectNM();
        this._nm.AllDevices();
    } 
    private createprofile(ssid: string,  password: string): ConnectionProfile {
        return {
            'connection': {
                type: new StrVariant('802-11-wireless'),
                uuid: new StrVariant(uuid()),
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
    private async connectNMSettings(){
        if (!this._nmSettings){
            this._nmSettings = await Settings.Connect(this._bus);
        } 
    }
    private async connectNM(){
        if (!this._nm){
            this._nm = await NetworkManager.Connect(this._bus);
            const paths = await this._nm.GetAllDevices();
            for (const path of paths){
                const iface = 'org.freedesktop.NetworkManager.Device';

            } 
        } 
    } 
} 