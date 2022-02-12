import dbus from 'dbus-next';
import * as util from 'util';
export type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};
export function decode(buf: Buffer): string {
    const dec = new util.TextDecoder('utf-8');
    return dec.decode(buf);
  }
