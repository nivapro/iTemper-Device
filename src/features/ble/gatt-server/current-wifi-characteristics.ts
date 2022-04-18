import * as gatt from '../gatt';
import { wifiDevice } from '../../wifi/wifi-device-init'; 
import { log } from '../../../core/logger';
import { getUuid, UUID_Designator} from './uuid';
import { isWiFiRequestValid, WiFiData, WiFiRequest } from './data';

export class CurrentWiFiCharacteristic extends  gatt.Characteristic<WiFiData>{
  public static UUID = getUuid(UUID_Designator.CurrentWiFi);
  constructor(protected _service: gatt.Service) {
    super(_service, CurrentWiFiCharacteristic.UUID);
    this.enableAsyncReadValue(this.handleReadRequest.bind(this));
    this.enableAsyncWriteValue(this.handleWriteRequest.bind(this), isWiFiRequestValid.bind(this));
    CurrentWiFiCharacteristic.configureMembers(this.getMembers());
    // const descriptor = new gatt.UserDescriptor('Device settings', this);
  }
  async handleReadRequest (): Promise<WiFiData> {
    return new Promise((resolve) => {
      const noWiFi = {ssid: '', security: '', quality: 0, channel: 0};
      wifiDevice.getCurrentAP().then((ap) => { 
           const currentWiFi = ap !== undefined
           ? {ssid: ap.ssid, security: ap.security, quality: ap.quality, channel: ap.quality }
           : noWiFi;
           log.info('current-wifi-characteristic.handleReadRequest, currentWifi=' + JSON.stringify(currentWiFi));
          resolve(currentWiFi);
      })
      .catch((e) => { log.warn('current-wifi-characteristcis.handleReadRequest, getCurrentNetwork error=' + e); resolve(noWiFi)} );
    });
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
                + network.ssid+ 'error=' + e);
          reject (e);
        });
      } else {
        log.error('current-wifi-characteristic.handleWriteRequest - invalid WiFi request=' + JSON.stringify(raw));
        reject ('Writevalue: invalid data');
      }
    });
  }
}
