
import * as gatt from './../gatt'

import { getUuid, UUID_Designator} from '../ble-uuid';
// import { AvailableWiFiCharacteristic } from '../characteristics/available-wifi-characteristic';
// import { CurrentWiFiCharacteristic } from '../characteristics/current-wifi-characteristic';
import { DeviceCharacteristic } from '../characteristics/device-characteristic';

const DOMAIN_PATH = '/io/itemper'; 
//
// All services, characteristics, and descriptors are located under this path.

export const SERVICE0_UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900100' // getUuid(UUID_Designator.PrimaryService);;
export class GattServer {
    _app = new gatt.Application(DOMAIN_PATH);
    _service = new gatt.Service(SERVICE0_UUID, this._app);
    _char = new DeviceCharacteristic(this._service);

    public init(){
        this._app.init();
    } 
} 


