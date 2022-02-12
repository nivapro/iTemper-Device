

import { Adertisement } from './gatt-server/gap-advertisment';

import * as uuids from './ble-uuid';

import * as gatt from './gatt-server';

import { log } from '../../core/logger';
import { Setting, Settings } from '../../core/settings';

const m = "ble"
function label(f: string = ""){
    return m + "." + f + ": ";
} 
const includeTYxPower = true;
const advertisment = new Adertisement('/io/itemper', 0, includeTYxPower);

const namePrefix = 'itemper ';

function AdvertisedName() {
  return namePrefix + Settings.get(Settings.SERIAL_NUMBER).value.toString();
}
async function startAdvertising() {
  try{
    advertisment.addServiceUUID(uuids.getUuid(uuids.UUID_Designator.PrimaryService));
    advertisment.setLocalName(AdvertisedName());
    await advertisment.publish();
    log.info(label("startAdvertising") + "Completed");
  } catch (e){
    log.error(label("startAdvertising") + "error="+ JSON.stringify(e));
  } 


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
    Settings.onChange(Settings.SERIAL_NUMBER, async (setting: Setting) => {
      log.info('ble.init: new SERIAL_NUMBER=' + setting.value.toString());
      if(advertisment.isAdvertising()){
        stopAdvertising();
        await startAdvertising();
      } 

    });
    try{
      await gatt.init();
      await startAdvertising();
      log.info(label("init") + "Completed");
    } catch (e){
      log.error(label("init") + "error="+ JSON.stringify(e));
    } 

}
