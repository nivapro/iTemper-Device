

import { Adertisement } from './gatt/gap-advertisment';
import * as constants from './gatt/gatt-constants';

import { GattServer, DOMAIN_PATH, SERVICE0_UUID }  from './gatt-server';
// import { GattServer, SERVICE0_UUID }  from './gatt-server';

import { log } from '../../core/logger';
import { Setting, Settings } from '../../core/settings';

const m = "ble"
function label(f: string = ""){
    return m + "." + f + ": ";
} 
// Gatt Server
const gattServer = new GattServer();

// GAP Advertisement
const AdvertisingPathIndex = 0;
const advertisingType = 'peripheral';
const apperance = constants.apperance.MultiSensor;
const includeTYxPower = true;

const advertisment = new Adertisement(DOMAIN_PATH,
                              AdvertisingPathIndex,
                              advertisingType,
                              apperance,
                              includeTYxPower);

const namePrefix = 'itemper ';


// function AdvertisedName() {
//   return namePrefix + Settings.get(Settings.SERIAL_NUMBER).value.toString();
// }
const now = Date.now()
function AdvertisedName() {
  return namePrefix + now.toString().slice(7);
}
async function initAdvertisement() {
  try{
    advertisment.addServiceUUID(SERVICE0_UUID);
    advertisment.setLocalName(AdvertisedName());
    await advertisment.init();
    log.info(label("startAdvertising") + "service=" + SERVICE0_UUID + ", name=" + AdvertisedName());
  } catch (e){
    log.error(label("startAdvertising") + "error="+ JSON.stringify(e));
  } 
}
async function startAdvertising() {
  try{
    advertisment.setLocalName(AdvertisedName());
    await advertisment.register();
    log.info(label("startAdvertising"));
  } catch (e){
    log.error(label("startAdvertising") + "error="+ JSON.stringify(e));
  } 
}
async function stopAdvertising() {
  try{
    await advertisment.unregister();
    log.info(label("stopAdvertising"));
  } catch (e){
    log.error(label("stopAdvertising") + "error="+ JSON.stringify(e));
  } 
}
export async function close() {
  log.debug(label("close"));
  await stopAdvertising();
  log.info(label("close") + 'Bluetooth GATT services closed');
}
export async function init() {
    log.debug(label("init"));
    Settings.onChange(Settings.SERIAL_NUMBER, async (setting: Setting) => {
      log.info(label("init") + 'new SERIAL_NUMBER=' + setting.value.toString());
      if(advertisment.isAdvertising()){
        await stopAdvertising();
        await startAdvertising();
      } 

    });
    try{
      await gattServer.init();
      log.info(label("init") + "GATT server initaited");
      await initAdvertisement();
      await startAdvertising();
      log.info(label("init") + "Advertising BLE GATT service");
    } catch (e){
      log.error(label("init") + "error="+ JSON.stringify(e));
    } 
}
