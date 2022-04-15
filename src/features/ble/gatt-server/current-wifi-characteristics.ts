import * as gatt from '../gatt';
import { wifiDevice } from '../../wifi'; 
import { log } from '../../../core/logger';
import { getUuid, UUID_Designator} from './uuid';
import { isWiFiRequestValid, WiFiData, WiFiRequest } from './data';

const handleReadRequest = async (): Promise<WiFiData> => {
  log.info('current-wifi-characteristic.handleReadRequest');
  const noNetwork = {ssid: '', security: '', quality: 0, channel: 1};
  return new Promise((resolve) => {
    wifiDevice.getCurrentAccessPoint().then((network) => { 
         const ap = network !== undefined
         ? {ssid: network.ssid, security: network.security, quality: network.quality, channel: network.quality }
         : noNetwork;
        resolve(ap);
    })
    .catch((e) => { log.warn('current-wifi-characteristcis.handleReadRequest, getCurrentNetwork error=' + e); resolve(noNetwork)} );
  });
}
export class CurrentWiFiCharacteristic extends  gatt.Characteristic<WiFiData>{
  public static UUID = getUuid(UUID_Designator.CurrentWiFi);
  constructor(protected _service: gatt.Service) {
    super(_service, CurrentWiFiCharacteristic.UUID);
    this.enableAsyncReadValue(handleReadRequest);
    this.enableAsyncWriteValue(this.handleWriteRequest, isWiFiRequestValid);
    CurrentWiFiCharacteristic.configureMembers(this.getMembers());
    // const descriptor = new gatt.UserDescriptor('Device settings', this);
  }
 async handleWriteRequest(raw: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      if (isWiFiRequestValid(raw)) {
        const network = raw as WiFiRequest;
        wifiDevice.connectNetwork(network.ssid, network.password)
        .then(() => {
          log.info('current-wifi-characteristic.handleWriteRequest - successfully connected to WiFi: ' + network.ssid);
          resolve();
        })
        .catch((e: any) => {
          log.error('current-wifi-characteristic.handleWriteRequest - cannot connect to wireless network: '
                + network.ssid);
          reject (e);
        });
      } else {
        log.error('current-wifi-characteristic.handleWriteRequest - invalid WiFi request');
        reject ('Writevalue: invalid data');
      }
    });
  }
}
