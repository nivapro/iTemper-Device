import dbus from 'dbus-next';
import { log } from '../../../core/logger';

import * as util from 'util';

import * as constants from './gatt-constants';

const m = 'gatt-utils';
function label(f: string = '') {
    return m + '.' + f + ':';
}

export type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};

export type PropertyOptions = dbus.interface.PropertyOptions;
export type MethodOptions = dbus.interface.MethodOptions;
export type SignalOptions = dbus.interface.SignalOptions;

// helper functions to encode/decode messages
export function decode(buf: Buffer): string {
    const decoder = new util.TextDecoder('utf-8');
    const decoded = decoder.decode(buf);
    return decoded;
  }
export function encode(value: string ): BufferSource {
    const enc = new util.TextEncoder();
    return enc.encode(value);
}

export class NotSupportedDBusError extends dbus.DBusError {
  constructor(public text: string, iface: string) {
      super('org.bluez.Error.NotSupported', iface + ': ' + text);
  }
}

export class FailedException extends dbus.DBusError {
  constructor(public text: string, iface: string) {
      super('org.bluez.Error.Failed', iface + ': ' + text);
  }
}