import * as gatt from '../gatt';
import { wifiDevice, AccessPointData } from '../../wifi'; 
import { log } from '../../../core/logger';
import { getUuid, UUID_Designator} from './uuid';
import { WiFiData } from './data';

type NetworkList = WiFiData[];
export class AvailableWiFiCharacteristic extends gatt.Characteristic<NetworkList> {
  public static UUID = getUuid(UUID_Designator.AvailableWiFi);
  private _networks: NetworkList = [];
  private _init = false;
  constructor(protected _service: gatt.Service) {
    super(_service, AvailableWiFiCharacteristic.UUID);
    this.enableAsyncReadValue(this.handleReadRequest.bind(this));
    this.enableNotify(this.handleStartNotify.bind(this), this.handleStopNotify.bind(this));
    AvailableWiFiCharacteristic.configureMembers(this.getMembers());
  }
  public async handleReadRequest(): Promise<NetworkList> {
    return new Promise((resolve) => {
      wifiDevice.scanNearbyAPs()
      .then((APs) => {
          this._networks = []; // Start with an empty network list
          log.info('available-wifi-characteristic.handleReadRequest: successfully scanned nearby WiFi networks');
          resolve(this.updateAndSort(APs));
      })
      .catch((e) => { log.error('available-wifi-characteristic.handleReadRequest, error=' + e); resolve ([]); });
    });
  }
  protected handleStartNotify(): void {
    log.info('AvailableWiFiCharacteristic.startNotify');
    this.Notifying = true;
    if (!this._init) {
      wifiDevice.nearbyAPsChanged(this.notify.bind(this));
      this._init = true;
    } 
  }
  protected handleStopNotify(): void {
    log.info('AvailableWiFiCharacteristic.stopNotify');
    this.Notifying = false;
  }
  public notify(newAPs: AccessPointData[]) {
    const Value = this.encode(this.updateAndSort(newAPs));
    if (this.Notifying) {
        log.info('available-wifi-characteristic.notify: Notifies nearby WiFi networks');
        AvailableWiFiCharacteristic.emitPropertiesChanged(this,{ Value },[]);
    }
  }
  private updateAndSort (APs: AccessPointData[]): NetworkList {
    for (const {ssid, security, quality, channel} of APs) {
      this._networks.push({ssid, security, quality, channel});
    }
    const sortedNetworks: NetworkList = this._networks.sort((a,b) => b.quality - a.quality);
    return sortedNetworks;
  } 
}
