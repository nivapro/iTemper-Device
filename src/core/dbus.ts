import dbus from 'dbus-next';
import { log } from './logger';

const m = 'core/dbus';
function label(f: string = '') {
    return m + '.' + f + ':';
}

const systemBus: dbus.MessageBus = dbus.systemBus();
export async function setBusName(name: string ) {
  const BUS_NAME = name;
  try{
    await systemBus.requestName(BUS_NAME, 0);
    log.info(label('setDBusName') + 'DBus name set to ' + BUS_NAME);
  } catch (e) {
    log.error(label('setDBusName') + 'Could not request name ' + BUS_NAME +', error=' + e);
  }
}
export function getBus(): dbus.MessageBus {
  return systemBus;
}

export type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};

export type PropertyOptions = dbus.interface.PropertyOptions;
export type MethodOptions = dbus.interface.MethodOptions;
export type SignalOptions = dbus.interface.SignalOptions;
