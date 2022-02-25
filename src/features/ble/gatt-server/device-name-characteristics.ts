import * as gatt from '../gatt';

import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { Settings } from '../../../core/settings';
import { getUuid, UUID_Designator} from './uuid';
import { DeviceName, isDeviceNameValid } from './data';

export class DeviceNameCharacteristic extends  gatt.Characteristic<DeviceName> {
  public static UUID = getUuid(UUID_Designator.DeviceName);
  constructor(protected _service: gatt.Service) {
    super(_service, DeviceNameCharacteristic.UUID);
    this.enableReadValue(this.handleReadRequest);
    this.enableWriteValue(this.handleWriteRequest, isDeviceNameValid);
    // const descriptor = new gatt.UserDescriptor('Device settings', this);
  }
  handleReadRequest(): DeviceName {
      const data = {
          name: Settings.get(Settings.SERIAL_NUMBER).value as string,
      };
      log.info('device-name-characteristic.handleReadRequest: success device data=' + stringify(data));
      return data;

  }
  handleWriteRequest(deviceData: DeviceName): void {
    log.info('device-name-characteristic.handleWriteRequest: success device data=' + stringify(deviceData));
        if (deviceData.name ) {
          this.update(Settings.SERIAL_NUMBER, deviceData.name);
        }
  }
  update(setting: string, value: string) {
    Settings.update(setting, value, (updated: boolean) => {
      if (updated) {
        log.info('device-name-characteristic: ' + setting + ' updated, value= ' + value);
      } else {
        log.error('device-name-characteristic: ' + setting + ' not updated');
      }
    });
  }
}
