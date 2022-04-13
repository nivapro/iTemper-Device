import wifi from 'node-wifi';
import {log, wLog} from '../../core/logger';
import {WiFi} from '../device/device-status';
import { WiFiDevice } from './wifi-device'; 
import { Settings } from '../../core/settings'; 
import { update } from 'lodash';
const wifiDevice = new WiFiDevice();
async function updateWifiSettings(){
    wifiDevice.GetAllAccessPoints()
    .then((APs) => { 
        const nearbySsids =[];
        for (const ssid in APs) {
            if (ssid !== '') {
                nearbySsids.push(ssid);
            } 
        } 
        Settings.update(Settings.NEARBY_SSIDs, nearbySsids.toString(),
                        (updated) => {log.info('wifi.init: NEARBY_SSIDs updated=' + updated)}, true);
    })
    .catch((e) => log.warn('wifi.init, GetAllAccessPoints error=' + e));
    wifiDevice.getCurrentNetwork()
    .then((network) => { 
        log.info('wifi.init, Current ssid=' + JSON.stringify(network))
        Settings.update(Settings.CURRENT_SSID, JSON.stringify(network), 
        (updated) => {log.info('wifi.init: CURRENT_SSID updated=' + updated)}, true);
    })
    .catch((e) => log.warn('wifi.init, getCurrentNetwork error=' + e));
    
} 
export async function init() {
    await wifiDevice.init();
    await updateWifiSettings();
    setInterval(updateWifiSettings, 60_000);
    await wifiDevice.connectNetwork('Limited', 'Mycketbra!');
    wifi.init({
        iface: null, // network interface, choose a random wifi interface if set to null
      });
    wifi.getCurrentConnections()
    .then((networks: Partial<WiFi[]> ) => {
        log.info('wifi, current networks' + JSON.stringify(networks));
    })
    .catch((e: Error) => { log.error('wifi, error=' + JSON.stringify(e)); });
}

