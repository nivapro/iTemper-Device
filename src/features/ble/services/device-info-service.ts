
import * as gatt from './../gatt'

import { getUuid, UUID_Designator} from '../ble-uuid';
// import { AvailableWiFiCharacteristic } from '../characteristics/available-wifi-characteristic';
// import { CurrentWiFiCharacteristic } from '../characteristics/current-wifi-characteristic';
import { DeviceCharacteristic } from '../characteristics/device-characteristic';

const DOMAIN_PATH = '/io/itemper'; 
//
// All services, characteristics, and descriptors are located under this path.

const SERVICE0_UUID = getUuid(UUID_Designator.PrimaryService);;

export const gattServer = new gatt.Application(DOMAIN_PATH);
const deviceInfoService = new gatt.Service(SERVICE0_UUID, gattServer);
const deviceCharacteristic = new DeviceCharacteristic(deviceInfoService);

// export class DeviceInfoService extends gatt.Service {
//   public static UUID = getUuid(UUID_Designator.PrimaryService);
//   constructor() {
//     super({
//       uuid: DeviceInfoService.UUID,
//       characteristics: [
//         new AvailableWiFiCharacteristic(),
//         new DeviceCharacteristic(),
//         new CurrentWiFiCharacteristic(),
//       ],
//     });
//   }
// }

