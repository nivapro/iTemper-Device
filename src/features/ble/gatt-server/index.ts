
import * as gatt from '../gatt'

import { getUuid, UUID_Designator} from './uuid';
import { AvailableWiFiCharacteristic } from './available-wifi';
import { CurrentWiFiCharacteristic } from './current-wifi';
import { DeviceInfoCharacteristic } from './device-info';

export const DOMAIN_PATH = '/io/itemper';
export const DOMAIN_NAME = 'io.itemper';
export const SERVICE0_UUID = getUuid(UUID_Designator.PrimaryService);

export class GattServer {
    _app = new gatt.Application(DOMAIN_PATH, DOMAIN_NAME);
    _service = new gatt.Service(SERVICE0_UUID, this._app);
    _deviceInfoChar = new DeviceInfoCharacteristic(this._service);
    _currentWiFiChar = new CurrentWiFiCharacteristic(this._service);
    _availableWiFiChar = new AvailableWiFiCharacteristic(this._service);
    public init(){
        this._app.init();
    } 
} 
