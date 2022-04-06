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
      if (data.length === 0) {
        data.push({ ssid: 'Test', security: 'WPA-2', quality: 74, channel: 6});
      } 
      resolve(data);
    })
    .catch((e: Error) => {
      log.error('available-wifi-characteristic.handleReadRequest - error retrieving available WiFi networks', e);
      reject(e);
    });
  });
}
export class AvailableWiFiCharacteristic extends gatt.Characteristic<NetworkList> {
  public static UUID = getUuid(UUID_Designator.AvailableWiFi);
  private Interval = 60_000;
  private timeout: NodeJS.Timeout;

  constructor(protected _service: gatt.Service) {
    super(_service, AvailableWiFiCharacteristic.UUID);
    this.enableAsyncReadValue(handleReadRequest.bind(this));
    this.enableNotify(this.hansleStartNotify.bind(this), this.handleStopNotify.bind(this));
    AvailableWiFiCharacteristic.configureMembers(this.getMembers());
  }

  public async handleWriteRequest(raw: unknown): Promise<boolean> {
      throw Error('AvailableWiFiCharacteristic: handleWriteRequest not implemented: received' + JSON.stringify(raw));
  }

  protected hansleStartNotify(): void {
    this.Notifying = true;
    this.publish();
    this.timeout = setInterval(() => {
      if (this.Notifying) {
        this.publish();
      }
    }, this.Interval);
  }
  protected handleStopNotify(): void {
    log.info('AvailableWiFiCharacteristic.stopNotify');
    if (this.Notifying) {
      this.Notifying = false;
      clearInterval(this.timeout);
    }
  }
 public async publish(): Promise<void> {
    handleReadRequest(5)
    .then((networks) => {
      for (const network of networks) {
        const valueStr = JSON.stringify(network);
        const Value = Buffer.from(valueStr);
        if (Value.length > this.MTU) {
          log.error('available-wifi-characteristic.publish: value exceeds maxValueSize ' + Value.length);
        } else {
          this.Value = Value;
          log.info('available-wifi-characteristic.publish valueStr=' + valueStr);
          if (this.Notifying) {
            AvailableWiFiCharacteristic.emitPropertiesChanged(this,{ Value },[]);
          }
        }
      }
    });
  }
}
