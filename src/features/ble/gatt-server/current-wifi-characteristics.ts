import * as gatt from '../gatt';
import wifi from 'node-wifi';
import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { WiFi } from '../../device/device-status';
import { getUuid, UUID_Designator} from './uuid';
import { isWiFiRequestValid, WiFiData, WiFiRequest } from './data';

export class CurrentWiFiCharacteristic extends  gatt.Characteristic<WiFiData>{
  public static UUID = getUuid(UUID_Designator.CurrentWiFi);
  constructor(protected _service: gatt.Service) {
    super(_service, CurrentWiFiCharacteristic.UUID);
    this.enableReadValue(this.handleReadRequest);
    this.enableWriteValue(this.handleWriteRequest, isWiFiRequestValid);
    // const descriptor = new gatt.UserDescriptor('Device settings', this);
  }
  async handleReadRequest(): Promise<WiFiData> {
    return new Promise((resolve, reject) => {
      wifi.getCurrentConnections()
      .then((networks: WiFi[]) => {
          const { ssid, security, quality, channel } = networks.length > 0
          ? networks[0]
          : {ssid: 'Test', security: 'WPA-2', quality: 75, channel: 1};
          const data: WiFiData = { ssid, security, quality, channel };
          log.info('current-wifi-characteristic.handleReadRequest: successfully retrieving network data='
          + stringify(data));
          resolve(data);
      })
      .catch((e: Error) => {
        log.error('current-wifi-characteristic.handleReadRequest - error retrieving wireless networks', e);
        reject(e);
      });
    });
  }

 async handleWriteRequest(raw: unknown): Promise<void> {
    return new Promise((resolve, reject) => {
      if (isWiFiRequestValid(raw)) {
        const network = raw as WiFiRequest;
        wifi.connect(network)
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
