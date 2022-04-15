import {log, wLog} from '../../core/logger';
import {WiFi} from '../device/device-status';
import { WiFiDevice } from './wifi-device'; 
import { Settings } from '../../core/settings'; 
const wifiDevice = new WiFiDevice();
async function updateWifiSettings(){
    try {
        wifiDevice.logNetworkManagerSettings().then(() => {});
        wifiDevice.GetAllAccessPoints()
        .then((APs) => { 
            const nearbySsids =[];
            for (const ssid in APs) {
                if (ssid !== '') {
                    nearbySsids.push(ssid);
                } 
            } 
            Settings.update(Settings.NEARBY_SSIDs, nearbySsids.toString(),
                            (updated) => {log.info('wifi.updateWifiSettings: NEARBY_SSIDs updated=' + updated)}, true);
        })
        .catch((e) => log.warn('wifi.updateWifiSettings, GetAllAccessPoints error=' + e));
        wifiDevice.getCurrentNetwork()
        .then((network) => { 
            if (network === '') {
                const ssid = 'Limited'
                log.info('wifi.updateWifiSettings, No current WiFi found, connecting to ' + ssid + ' ...');
                wifiDevice.connectNetwork(ssid, 'Mycketbra!')
                .then(()=> log.info('wifi.updateWifiSettings, connectNetwork done'))
                .catch((e) => log.error('wifi.updateWifiSettings, connectNetwork error=' + e));
            } else {
                Settings.update(Settings.CURRENT_SSID, network,
                    (updated) => {log.info('wifi.updateWifiSettings: CURRENT_SSID updated=' + updated)}, true);
            } 
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
    } catch (e) {
        log.error('wifi.init, error=' + e)
    } 
}
