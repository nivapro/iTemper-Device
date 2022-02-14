import dbus from 'dbus-next';
import * as util from 'util';
import * as constants from './gatt-constants'
export type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};

// helper functions to encode/decode messages
export function decode(buf: Buffer): string {
    const dec = new util.TextDecoder('utf-8');
    return dec.decode(buf);
  }
export function encode(value: string ): BufferSource {
    const enc = new util.TextEncoder();
    return enc.encode(value);
}

export class NotSupportedDBusError extends dbus.DBusError {
  constructor(public text: string) {
      super('org.bluez.Error.NotSupported', constants.GATT_CHARACTERISTIC_INTERFACE + ': ' + text);
  }
}