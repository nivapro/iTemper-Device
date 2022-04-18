import { log } from '../../core/logger';
import { WiFiDevice } from './wifi-device'; 
import { Settings } from '../../core/settings'; 
export const wifiDevice = new WiFiDevice();
async function updateWifiSettings(){
    try {
        wifiDevice.logNMWiFiProps().then(() => {});
        wifiDevice.scanNearbyAPs()
        .then((APs) => { 
            const nearbyAPs = [];
            for (const ap of APs) {
                if (ap.ssid !== '') {
                    nearbyAPs.push(ap.ssid);
                } 
            } 
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
        setInterval(updateWifiSettings, 300_000);
    } catch (e) {
        log.error('wifi.init, error=' + e)
    } 
}
