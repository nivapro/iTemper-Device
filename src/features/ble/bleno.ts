import bleno from 'bleno';
import { stringify } from '../../core/helpers';
import { log } from '../../core/logger';
import { Setting, Settings } from '../../core/settings';
import { DeviceInfoService } from './services/device-info-service';
const deviceInfoService = new DeviceInfoService();
let advertising = false;
let pendingStart = false;
const namePrefix = 'itemper ';

function AdvertisedName() {
  return namePrefix + Settings.get(Settings.SERIAL_NUMBER).value.toString();
}
function startAdvertising() {
  const name = AdvertisedName();
  log.info('ble.startAdvertising name=' + name);
  bleno.startAdvertising(name, [DeviceInfoService.UUID]);
}
function stopAdvertising() {
  log.info('ble.stopAdvertising');
  bleno.stopAdvertising();
}
export function init() {
  Settings.onChange(Settings.SERIAL_NUMBER, (setting: Setting) => {
    log.info('ble.init: new SERIAL_NUMBER=' + setting.value.toString());
    if (advertising) {
      pendingStart = true;
      stopAdvertising();
    }
  });
  bleno.on('stateChange', (state: any) => {
    log.info(`ble.init.on(stateChange): ${state}`);
    if (state === 'poweredOn') {
      setTimeout(() => startAdvertising(), 5_000); // just to give the device a chance to start up
    } else {
      stopAdvertising();
    }
  });
  bleno.on('advertisingStart', (error?: Error) => {
    if (!error) {
      bleno.setServices([deviceInfoService], (error: Error) => {
        if (error) {
          log.error('ble.init.setServices: error=' +  error);
        } else {
          log.info('ble.init.setServices: advertising deviceInfoService=' +  stringify(deviceInfoService));
          advertising = true;
        }
      });
    } else {
      log.error('ble.init.advertisingStart:' + error.message);
    }
  });
  bleno.on('advertisingStop', () => {
    log.error('ble.advertisingStop');
    advertising = false;
    if (pendingStart) {
      pendingStart = false;
      setTimeout(() => startAdvertising(), 5_000);
    }
  });
  bleno.on('accept', (address: string) => {
    log.info('ble.accept address=' + address);
  });
  bleno.on('disconnect', (clientAddress: string) => {
    log.info('ble.disconnect clientAddress=' + clientAddress);
  });
}

