import * as gatt from '../gatt';

import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { Settings } from '../../../core/settings';
import { getUuid, UUID_Designator} from './uuid';
import { DeviceKey, isDeviceKeyValid } from './data';

export class DeviceKeyCharacteristic extends  gatt.Characteristic<DeviceKey> {
  public static UUID = getUuid(UUID_Designator.DeviceKey);
  constructor(protected _service: gatt.Service) {
    super(_service, DeviceKeyCharacteristic.UUID);
    this.enableReadValue(this.handleReadRequest);
    this.enableWriteValue(this.handleWriteRequest, isDeviceKeyValid);
  }
  handleReadRequest(): DeviceKey {
      const data = {
          key: Settings.get(Settings.SHARED_ACCESS_KEY).value as string,
      };
      log.info('device-key-characteristic.handleReadRequest: success device data=' + stringify(data));
      return data;

  }
  handleWriteRequest(deviceData: DeviceKey): void {
        if (deviceData.key ) {
          this.update(Settings.SHARED_ACCESS_KEY, deviceData.key);
        }
  }
  update(setting: string, value: string) {
    Settings.update(setting, value, (updated: boolean) => {
      if (updated) {
        log.info('device-key-characteristic: ' + setting + ' updated, value= ' + value);
      } else {
        log.error('device-key-characteristic: ' + setting + ' not updated');
      }
    });
  }
}
