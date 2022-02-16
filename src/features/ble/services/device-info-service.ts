
import * as gatt from './../gatt'

import { getUuid, UUID_Designator} from '../ble-uuid';
import { AvailableWiFiCharacteristic } from '../characteristics/available-wifi';
import { CurrentWiFiCharacteristic } from '../characteristics/current-wifi';
import { DeviceInfoCharacteristic } from '../characteristics/device-info';

const DOMAIN_PATH = '/io/itemper'; 
const DOMAIN_NAME = 'io.itemper'; 
//
// All services, characteristics, and descriptors are located under this path.

export const SERVICE0_UUID = getUuid(UUID_Designator.PrimaryService);;
export class GattServer {
    _app = new gatt.Application(DOMAIN_NAME , DOMAIN_PATH);
    _service = new gatt.Service(SERVICE0_UUID, this._app);
    _deviceInfoChar = new DeviceInfoCharacteristic(this._service);
    _currentWiFiChar = new CurrentWiFiCharacteristic(this._service);
    _availableWiFiChar = new AvailableWiFiCharacteristic(this._service);
    public init(){
        this._app.init();
    } 
} 
