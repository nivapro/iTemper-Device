
import * as gatt from '../gatt'

import { getUuid, UUID_Designator} from './uuid';
import { AvailableWiFiCharacteristic } from './available-wifi-characteristics';
import { CurrentWiFiCharacteristic } from './current-wifi-characteristics';
import { DeviceColorCharacteristic } from './device-color-characteristics';
import { DeviceInfoCharacteristic } from './device-info-characteristics';
import { DeviceNameCharacteristic } from './device-name-characteristics';
import { DeviceKeyCharacteristic } from './device-key-characteristics';

export const DBUS_APP_PATH = '/io/itemper';
export const DBUS_DEST_NAME = 'io.itemper';
export const SERVICE0_UUID = getUuid(UUID_Designator.PrimaryService);

const _app = new gatt.Application(DBUS_APP_PATH, DBUS_DEST_NAME);
const _service = new gatt.Service(SERVICE0_UUID, _app);
const _deviceInfoChar = new DeviceInfoCharacteristic(_service);
const _currentWiFiChar = new CurrentWiFiCharacteristic(_service);
const _deviceName = new DeviceNameCharacteristic(_service);
const _deviceColor = new DeviceColorCharacteristic(_service);
const _deviceKey = new DeviceKeyCharacteristic(_service);
const _availableWiFiChar = new AvailableWiFiCharacteristic(_service);

export class GattServer {
    public init(){
        _app.init();
    } 
} 
