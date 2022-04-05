import * as gatt from '../gatt';
import wifi from 'node-wifi';
import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { WiFi } from '../../device/device-status';
import { getUuid, UUID_Designator} from './uuid';
import { WiFiData } from './data';

type NetworkList = WiFiData[];
const handleReadRequest = async (MaxNetworks: number = 5): Promise<NetworkList> => {
  return new Promise((resolve, reject) => {
    wifi.scan()
    .then((networks: WiFi[]) => {
      const sorted = networks.filter((n) => n.ssid !== '')
      .sort((a,b) => b.quality - a.quality)
      .slice(0, networks.length < MaxNetworks ? networks.length : MaxNetworks);
      const data: NetworkList = [];
      sorted.forEach((network: WiFi) => data.push(
        { ssid: network.ssid, security: network.security, quality: network.quality, channel: network.channel}));
        log.info('available-wifi-characteristic.handleReadRequest: successfully retrieving network data='
        + stringify(data));
      resolve(data);
    })
    .catch((e: Error) => {
      log.error('available-wifi-characteristic.handleReadRequest - error retrieving available WiFi networks', e);
      reject(e);
    });
  });
}
export class AvailableWiFiCharacteristic extends  gatt.Characteristic<NetworkList> {
  public static UUID = getUuid(UUID_Designator.AvailableWiFi);
  private Interval = 5_000;
  private timeout: NodeJS.Timeout;

  constructor(protected _service: gatt.Service) {
    super(_service, AvailableWiFiCharacteristic.UUID);
    this.enableReadValue(handleReadRequest.bind(this));
    this.enableNotify(this.startNotify.bind(this), this.stopNotify.bind(this));
  }

  public async handleWriteRequest(raw: unknown): Promise<boolean> {
      throw Error('AvailableWiFiCharacteristic: handleWriteRequest not implemented: received' + JSON.stringify(raw));
  }

  public async startNotify() {
    this.Notifying = true;
    this.publish();
    this.timeout = setInterval(() => {
      if (this.Notifying) {
        this.publish();
      }
    }, this.Interval);
  }
  public async stopNotify() {
    log.info('AvailableWiFiCharacteristic.stopNotify');
    if (this.Notifying) {
      this.Notifying = false;
      clearInterval(this.timeout);
    }
  }
 public async publish(): Promise<void> {
    log.info('available-wifi-characteristic.publish');
    handleReadRequest(256)
    .then((networks) => {
      for (const network of networks) {
        const valueStr = JSON.stringify(network);
        const value = Buffer.from(valueStr);
        if (value.length > this.MTU) {
          log.error('available-wifi-characteristic.publish: value exceeds maxValueSize ' + value.length);
        } else {
          this.Value = value;
          log.info('available-wifi-characteristic.publish' + valueStr);
          if (this.Notifying) {
            AvailableWiFiCharacteristic.ValueChanged<NetworkList>(this);
          }
        }
      }
    });
  }
}
