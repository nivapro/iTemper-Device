import wifi from 'node-wifi';
import {log, wLog} from '../../core/logger';
import {WiFi} from '../device/device-status';
import { WiFiDevice } from './wifi-device'; 
import { Settings } from '../../core/settings'; 
const wifiDevice = new WiFiDevice();
async function updateWifiSettings(){
    try {
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
        .catch((e) => log.warn('wifi.updateWifiSettings, GetAllAccessPoints error=' + e));
        wifiDevice.getCurrentNetwork()
        .then((network) => { 
            log.info('wifi.init, Current ssid=' + JSON.stringify(network))
            Settings.update(Settings.CURRENT_SSID, JSON.stringify(network), 
            (updated) => {log.info('wifi.updateWifiSettings: CURRENT_SSID updated=' + updated)}, true);
        })
        .catch((e) => log.warn('wifi.updateWifiSettings, getCurrentNetwork error=' + e));
    } catch(e) {
        log.error('wifi.updateWifiSettings, error=' + e)
    
    } 
    
} 
export async function init() {
    try  {
        log.info('wifi.init, init WiFi device ...');
        await wifiDevice.init();
        await updateWifiSettings();
        setInterval(updateWifiSettings, 30_000);
        log.info('wifi.init, connecting WiFi network ...');
        // await wifiDevice.connectNetwork('Limited', 'Mycketbra!');
    } catch (e) {
        log.error('wifi.init, error=' + e)
    } 

    // wifi.init({
    //     iface: null, // network interface, choose a random wifi interface if set to null
    //   });
    // wifi.getCurrentConnections()
    // .then((networks: Partial<WiFi[]> ) => {
    //     log.info('wifi, current networks' + JSON.stringify(networks));
    // })
    // .catch((e: Error) => { log.error('wifi, error=' + JSON.stringify(e)); });
}

