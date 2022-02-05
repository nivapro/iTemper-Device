
import { Adertisement } from './gatt-server/gap-advertisment';

import * as uuids from './ble-uuid';

import { log } from '../../core/logger';
import { Setting, Settings } from '../../core/settings';

const advertisment = new Adertisement('io/itemper', 0);

let advertising = false;
const namePrefix = 'itemper ';

function AdvertisedName() {
  return namePrefix + Settings.get(Settings.SERIAL_NUMBER).value.toString();
}
function startAdvertising() {
  log.info('ble.startAdvertising');
  advertising = true;
  advertisment.addServiceUUID(uuids.getUuid(uuids.UUID_Designator.PrimaryService));
  advertisment.setLocalName(AdvertisedName());
  log.info('ble.startAdvertising name=' + AdvertisedName());
  // bleno.startAdvertising(name, [DeviceInfoService.UUID]);
}
function stopAdvertising() {
  advertising = false;
  log.info('ble.stopAdvertising');
  // bleno.stopAdvertising();
}
export function close() {
  log.debug('ble.close');
  stopAdvertising();
}
export function init() {
  log.debug('ble.init');
  Settings.onChange(Settings.SERIAL_NUMBER, (setting: Setting) => {
    log.info('ble.init: new SERIAL_NUMBER=' + setting.value.toString());
    advertisment.setLocalName(AdvertisedName());
  });
  if (!advertising) {
    startAdvertising();
  }
  // bleno.on('stateChange', (state: any) => {
  //   log.info(`ble.init.on(stateChange): ${state}`);
  //   if (state === 'poweredOn') {
  //     setTimeout(() => startAdvertising(), 5_000); // just to give the device a chance to start up
  //   } else {
  //     stopAdvertising();
  //   }
  // });
  // bleno.on('advertisingStart', (error?: Error) => {
  //   if (!error) {
  //     bleno.setServices([deviceInfoService], (error: Error) => {
  //       if (error) {
  //         log.error('ble.init.setServices: error=' +  error);
  //       } else {
  //         log.info('ble.init.setServices: advertising deviceInfoService=' +  stringify(deviceInfoService));
  //         advertising = true;
  //       }
  //     });
  //   } else {
  //     log.error('ble.init.advertisingStart:' + error.message);
  //   }
  // });
  // bleno.on('advertisingStop', () => {
  //   log.error('ble.advertisingStop');
  //   advertising = false;
  //   if (pendingStart) {
  //     pendingStart = false;
  //     setTimeout(() => startAdvertising(), 5_000);
  //   }
  // });
  // bleno.on('accept', (address: string) => {
  //   log.info('ble.accept address=' + address);
  // });
  // bleno.on('disconnect', (clientAddress: string) => {
  //   log.info('ble.disconnect clientAddress=' + clientAddress);
  // });
}

