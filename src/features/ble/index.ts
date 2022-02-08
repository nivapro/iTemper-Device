

import { Adertisement } from './gatt-server/gap-advertisment';

import * as uuids from './ble-uuid';

import * as gatt from './gatt-server';

import { log } from '../../core/logger';
import { Setting, Settings } from '../../core/settings';

const advertisment = new Adertisement('io/itemper', 0);

const namePrefix = 'itemper ';

function AdvertisedName() {
  return namePrefix + Settings.get(Settings.SERIAL_NUMBER).value.toString();
}
function startAdvertising() {
  log.info('ble.startAdvertising');
  advertisment.addServiceUUID(uuids.getUuid(uuids.UUID_Designator.PrimaryService));
  advertisment.setLocalName(AdvertisedName());
  log.info('ble.startAdvertising name=' + AdvertisedName());
  // bleno.startAdvertising(name, [DeviceInfoService.UUID]);
}
function stopAdvertising() {
  log.info('ble.stopAdvertising');
  // bleno.stopAdvertising();
}
export function close() {
  log.debug('ble.close');
  stopAdvertising();
  log.info('Bluetooth GATT services closed');
}
export async function init() {
    log.debug('ble.init');
    Settings.onChange(Settings.SERIAL_NUMBER, (setting: Setting) => {
      log.info('ble.init: new SERIAL_NUMBER=' + setting.value.toString());
      advertisment.setLocalName(AdvertisedName());
    });
    await gatt.init();
    startAdvertising();
}
