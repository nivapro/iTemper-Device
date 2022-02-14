import * as gatt from './../gatt';

import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { Settings } from '../../../core/settings';
import { getUuid, UUID_Designator} from '../ble-uuid';
import { DeviceData, isDeviceDataValid } from './characteristic-data';

export class DeviceCharacteristic extends  gatt.Characteristic<DeviceData> {
  public static UUID = getUuid(UUID_Designator.DeviceInfo);
  constructor(protected _service: gatt.Service) {
    super(_service, DeviceCharacteristic.UUID,  ['read', 'write']);
    this.setReadFn(this.handleReadRequest);
    this.setWriteFn(this.handleWriteRequest, isDeviceDataValid);
    this.addDescriptor(new gatt.UserDescriptor('Device settings', this))
  }
  handleReadRequest(): Promise<DeviceData> {
    return new Promise((resolve) => {
      const data = {
          name: Settings.get(Settings.SERIAL_NUMBER).value as string,
          color:  Settings.get(Settings.COLOR).value as string,
          deviceID: '123',
          key: Settings.get(Settings.SHARED_ACCESS_KEY).value as string,
      };
      log.info('device-characteristic.handleReadRequest: successfully retrieving device data='
      + stringify(data));
      resolve(data);
    });
  }

  handleWriteRequest(deviceData: DeviceData): Promise<void> {
    return new Promise((resolve) => {
        this.update(Settings.SERIAL_NUMBER, deviceData.name);
        this.update(Settings.SHARED_ACCESS_KEY, deviceData.key);
        if (deviceData.color ) {
          this.update(Settings.COLOR, deviceData.color);
        }
        resolve();
    });
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
