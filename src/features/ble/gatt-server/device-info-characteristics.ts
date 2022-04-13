import * as gatt from '../gatt';

import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { Settings } from '../../../core/settings';
import { getUuid, UUID_Designator} from './uuid';
import { DeviceInfo, isDeviceInfoValid } from './data';

export class DeviceInfoCharacteristic extends  gatt.Characteristic<DeviceInfo> {
  public static UUID = getUuid(UUID_Designator.DeviceInfo);
  constructor(protected _service: gatt.Service) {
    super(_service, DeviceInfoCharacteristic.UUID);
    this.enableReadValue(this.handleReadRequest);
    this.enableWriteValue(this.handleWriteRequest, isDeviceInfoValid);
    DeviceInfoCharacteristic.configureMembers(this.getMembers());
    // const descriptor = new gatt.UserDescriptor('Device settings', this);
  }
  handleReadRequest(): DeviceInfo {
      const data = {
          name: Settings.get(Settings.SERIAL_NUMBER).value as string,
          color:  Settings.get(Settings.COLOR).value as string,
          key: Settings.get(Settings.SHARED_ACCESS_KEY).value as string,
      };
      log.info('device-characteristic.handleReadRequest: success device data=' + stringify(data));
      return data;

  }

  handleWriteRequest(deviceInfo: DeviceInfo): void {
    if (isDeviceInfoValid(deviceInfo))  {
      this.update(Settings.SERIAL_NUMBER, deviceInfo.name);
      this.update(Settings.SHARED_ACCESS_KEY, deviceInfo.key);
      this.update(Settings.COLOR, deviceInfo.color);
    } else {
      log.error('device-characteristic.handleWriteRequest: received invalid deviceInfo=' + JSON.stringify(deviceInfo));
    } 
  }

  update(setting: string, value: string) {
    Settings.update(setting, value, (updated: boolean) => {
      if (updated) {
        log.info('device-characteristic: ' + setting + ' updated, value= ' + value);
      } else {
        log.error('device-characteristic: ' + setting + ' not updated');
      }
    });
  }
}
