import * as gatt from '../gatt';
import { wifiDevice } from '../../wifi'; 
import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { getUuid, UUID_Designator} from './uuid';
import { WiFiData } from './data';

type NetworkList = WiFiData[];
const handleReadRequest = async (MaxNetworks: number = 5): Promise<NetworkList> => {
  return new Promise((resolve) => {
    wifiDevice.GetAllAccessPoints()
    .then((APs) => {
        const networks:NetworkList = [];
        for (const ssid in APs) {
          networks.push({ ssid, security: APs[ssid].security, quality: APs[ssid].quality, channel: APs[ssid].channel });
        }
        const data = networks.sort((a,b) => b.quality - a.quality)
        .slice(0, networks.length < MaxNetworks ? networks.length : MaxNetworks);
        log.info('available-wifi-characteristic.handleReadRequest: successfully retrieving network data=' + stringify(data));
        resolve(data);
        
    })
    .catch((e) => { log.error('available-wifi-characteristic.handleReadRequest, error=' + e); resolve ([]); });
  });
}
export class AvailableWiFiCharacteristic extends gatt.Characteristic<NetworkList> {
  public static UUID = getUuid(UUID_Designator.AvailableWiFi);
  private Interval = 5_000;
  private timeout: NodeJS.Timeout;
  private notificationTimeout: NodeJS.Timeout;
  private notificationPeriod = 60_000;

  constructor(protected _service: gatt.Service) {
    super(_service, AvailableWiFiCharacteristic.UUID);
    this.enableAsyncReadValue(handleReadRequest.bind(this));
    this.enableNotify(this.handleStartNotify.bind(this), this.handleStopNotify.bind(this));
    AvailableWiFiCharacteristic.configureMembers(this.getMembers());
  }
  public async handleWriteRequest(raw: unknown): Promise<boolean> {
      throw Error('AvailableWiFiCharacteristic: handleWriteRequest not implemented: received' + JSON.stringify(raw));
  }
  protected handleStartNotify(): void {
    log.info('AvailableWiFiCharacteristic.startNotify');
    this.Notifying = true;
    this.update();
    this.timeout = setInterval(() => {
      if (this.Notifying) {
        this.update();
      }
    }, this.Interval);
    this.notificationTimeout = setTimeout(() => {
      if (this.Notifying) {
        this.handleStopNotify();
      }
    }, this.notificationPeriod);
  }
  protected handleStopNotify(): void {
    log.info('AvailableWiFiCharacteristic.stopNotify');
    if (this.Notifying) {
      this.Notifying = false;
      clearInterval(this.timeout);
      clearTimeout(this.notificationTimeout);
    }
  }
  public async update(): Promise<void> {
    handleReadRequest(10)
    .then((networks) => {
      const valueStr = JSON.stringify(networks);
      const Value = Buffer.from(valueStr)
      if (Value.length > this.MTU) {
        log.error('available-wifi-characteristic.publish: value exceeds maxValueSize ' + Value.length);
      } else {
        this.Value = Value;
        if (this.Notifying) {
          log.info('available-wifi-characteristic.publish emitting valueStr=' + valueStr);
            AvailableWiFiCharacteristic.emitPropertiesChanged(this,{ Value },[]);
          }
      }
    });
  }
}
