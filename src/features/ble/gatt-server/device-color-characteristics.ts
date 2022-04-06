import * as gatt from '../gatt';

import { stringify } from '../../../core/helpers';
import { log } from '../../../core/logger';
import { Settings } from '../../../core/settings';
import { getUuid, UUID_Designator} from './uuid';
import { DeviceColor, isDeviceColorValid } from './data';

export class DeviceColorCharacteristic extends  gatt.Characteristic<DeviceColor> {
  public static UUID = getUuid(UUID_Designator.DeviceColor);
  constructor(protected _service: gatt.Service) {
    super(_service, DeviceColorCharacteristic.UUID);
    this.enableReadValue(this.handleReadRequest);
    this.enableWriteValue(this.handleWriteRequest, isDeviceColorValid);
    DeviceColorCharacteristic.configureMembers(this.getMembers());
  }
  handleReadRequest(): DeviceColor {
      const data = {
          color: Settings.get(Settings.COLOR).value as string,
      };
      log.info('device-color-characteristic.handleReadRequest: success device data=' + stringify(data));
      return data;

  }
  handleWriteRequest(deviceData: DeviceColor): void {
        if (deviceData.color ) {
          this.update(Settings.COLOR, deviceData.color);
        }
  }
  update(setting: string, value: string) {
    Settings.update(setting, value, (updated: boolean) => {
      if (updated) {
        log.info('device-color-characteristic: ' + setting + ' updated, value= ' + value);
      } else {
        log.error('device-color-characteristic: ' + setting + ' not updated');
      }
    });
  }
}
