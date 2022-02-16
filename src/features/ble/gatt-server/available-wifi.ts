import * as gatt from '../gatt';
import wifi from 'node-wifi';
import { log } from '../../../core/logger';
import { WiFi } from '../../device/device-status';
import { getUuid, UUID_Designator} from './uuid';
import { WiFiData } from './data';

type NetworkList = WiFiData[];
export class AvailableWiFiCharacteristic extends  gatt.Characteristic<NetworkList> {
  public static UUID = getUuid(UUID_Designator.AvailableWiFi);
  private Interval = 5_000;
  private timeout: NodeJS.Timeout;

  constructor(protected _service: gatt.Service) {
    super(_service, AvailableWiFiCharacteristic.UUID);
    this.enableReadValue(this.handleReadRequest);
    this.enableNotify(this.startNotify, this.stopNotify);
  }

  handleWriteRequest(raw: unknown): Promise<boolean> {
      throw Error('AvailableWiFiCharacteristic: handleWriteRequest not implemented: received' + JSON.stringify(raw));
  }
  handleReadRequest(MaxNetworks: number = 5): Promise<NetworkList> {
    return new Promise((resolve, reject) => {
      wifi.scan()
      .then((networks: WiFi[]) => {
        const sorted = networks.filter((n) => n.ssid !== '')
        .sort((a,b) => b.quality - a.quality)
        .slice(0, networks.length < MaxNetworks ? networks.length : MaxNetworks);
        const data: NetworkList = [];
        sorted.forEach((network: WiFi) => data.push(
          { ssid: network.ssid, security: network.security, quality: network.quality, channel: network.channel}));
        resolve(data);
      })
      .catch((e: Error) => {
        log.error('available-wifi-characteristic.handleReadRequest - error retrieving available WiFi networks', e);
        reject(e);
      });
    });
  }
  startNotify() {
    this.Notifying = true;
    this.publish();
    this.timeout = setInterval(() => {
      if (this.Notifying) {
        this.publish();
      }
    }, this.Interval);
  }
  stopNotify() {
    log.info('AvailableWiFiCharacteristic.stopNotify');
    if (this.Notifying) {
      this.Notifying = false;
      clearInterval(this.timeout);
    }

  }
  publish() {
    log.info('available-wifi-characteristic.publish');
    this.handleReadRequest(256)
    .then((networks) => {
      for (const network of networks) {
        const value = Buffer.from(JSON.stringify(network));
        if (value.length > this.MTU) {
          log.error('available-wifi-characteristic.publish: value exceeds maxValueSize ' + value.length);
        } else {
          this.Value = value;
          log.info('available-wifi-characteristic.publish');
          if (this.Notifying) {
            AvailableWiFiCharacteristic.ValueChanged<NetworkList>(this);
          }
        }
      }
    });
  }
}
