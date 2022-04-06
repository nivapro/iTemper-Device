import * as gatt from '../gatt';

import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { Settings } from '../../../core/settings';
import { getUuid, UUID_Designator} from './uuid';
import { DeviceData, isDeviceDataValid } from './data';

export class DeviceInfoCharacteristic extends  gatt.Characteristic<DeviceData> {
  public static UUID = getUuid(UUID_Designator.DeviceInfo);
  constructor(protected _service: gatt.Service) {
    super(_service, DeviceInfoCharacteristic.UUID);
    this.enableReadValue(this.handleReadRequest);
    this.enableWriteValue(this.handleWriteRequest, isDeviceDataValid);
    DeviceInfoCharacteristic.configureMembers(this.getMembers());
    // const descriptor = new gatt.UserDescriptor('Device settings', this);
  }
  handleReadRequest(): DeviceData {
      const data = {
          name: Settings.get(Settings.SERIAL_NUMBER).value as string,
          color:  Settings.get(Settings.COLOR).value as string,
          deviceID: '123',
          key: Settings.get(Settings.SHARED_ACCESS_KEY).value as string,
      };
      log.info('device-characteristic.handleReadRequest: success device data=' + stringify(data));
      return data;

  }

  handleWriteRequest(deviceData: DeviceData): void {
        this.update(Settings.SERIAL_NUMBER, deviceData.name);
        this.update(Settings.SHARED_ACCESS_KEY, deviceData.key);
        if (deviceData.color ) {
          this.update(Settings.COLOR, deviceData.color);
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
