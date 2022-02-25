import { conf } from './config';

import { log, setLevel } from './logger';

export type SettingValue = string | number;

export interface Setting {
    name: string;
    label: string;
    value: SettingValue;
    defaultValue: SettingValue;
    text: string;
    readonly: boolean;
}

export type Listener = (setting: Setting) => void;
export interface SettingListener {
    settingName: string;
    publish: Listener;
}

export class Settings {
    private static map = new Map<string, Setting>();
    private static listeners: SettingListener[] = [];
    public static COLOR= 'COLOR';
    public static SERIAL_NUMBER = 'SERIAL_NUMBER';
    public static CONSOLE_LEVEL = 'CONSOLE_LEVEL';
    public static ERROR_LEVEL= 'ERROR_LEVEL';
    public static ERROR_LOG_FILE = 'ERROR_LOG_FILE';
    public static HOSTNAME = 'HOSTNAME';
    public static ITEMPER_URL = 'ITEMPER_URL';
    public static POLL_INTERVAL = 'POLL_INTERVAL';
    public static WS_ORIGIN = 'WS_ORIGIN';
    public static WS_URL = 'WS_URL';
    public static SHARED_ACCESS_KEY = 'SHARED_ACCESS_KEY';

    public static READONLY = true;

    public static init() {
        Settings.add(Settings.COLOR, 'Color', conf.COLOR,  '',
        'Color', !Settings.READONLY);
        Settings.add(Settings.SERIAL_NUMBER, 'Serial Number', conf.SERIAL_NUMBER,  '',
        'Serial Number (SN)', !Settings.READONLY);
        Settings.add(Settings.CONSOLE_LEVEL, 'Console log level', conf.CONSOLE_LEVEL, 'info',
            'Event level logged on console: error | info | debug', !Settings.READONLY);
        Settings.add(Settings.ERROR_LEVEL, 'Error file log level', conf.ERROR_LEVEL, 'error',
            'Event level logged on file: error | info | debug', !Settings.READONLY);
        Settings.add(Settings.ERROR_LOG_FILE, 'Application error log file', conf.ERROR_LOG_FILE, 'itemper-error.log',
            'Name of the log file. You find it in the application root directory', Settings.READONLY);
        Settings.add(Settings.HOSTNAME, 'Hostname', conf.HOSTNAME, '',
            'This device \'s hostname', Settings.READONLY);
        Settings.add(Settings.ITEMPER_URL, 'iTemper URL', conf.ITEMPER_URL, 'https://itemper.io',
            'The device use\'s this URL when connecting to iTemper', !Settings.READONLY);
        Settings.add(Settings.POLL_INTERVAL, 'Sensor poll interval', +conf.POLL_INTERVAL, 60000,
            'Interval (ms) between polling the sensors', !Settings.READONLY);
        Settings.add(Settings.WS_ORIGIN, 'WebSocket origin', conf.WS_ORIGIN, 'https://itemper.io',
            'Origin used when connecting to iTemper with WebSockets', !Settings.READONLY);
        Settings.add(Settings.WS_URL, 'WebSocket URL', conf.WS_URL, 'wss://itemper.io',
            'WebSocket URL to iTemper', !Settings.READONLY);
        Settings.add(Settings.SHARED_ACCESS_KEY, 'Shared access key', conf.SHARED_ACCESS_KEY, '',
            'Add the Shared key to a device on an itemper.io user account ' +
            ' to allow the this device to log sensor data on itemper.io', !Settings.READONLY);


        // Helper
        Settings.onChange(Settings.CONSOLE_LEVEL, (setting: Setting) => {
            setLevel(setting.value.toString());
        });
    }
    public static onChange(settingName: string, publish: Listener) {
        log.info('Settings.onChange: ' + settingName);
        Settings.listeners.push({settingName, publish});
        const setting = Settings.get(settingName);
        if (setting) {
            publish(setting);
        }
    }
    private static publish(setting: Setting) {
        for (const listener of Settings.listeners) {
            if (listener.settingName === setting.name) {
                listener.publish(setting);
            }
        }
    }
    public static all(): Setting[] {
        const allSettings: Setting[] = [];
        Settings.forEach(setting=> allSettings.push(setting));
        return allSettings;
    }
    public static add(  name: string,
                        label: string,
                        value: SettingValue | undefined,
                        defaultValue: SettingValue,
                        text: string,
                        readonly: boolean) {
        const setting = Settings.create(name, label, value, defaultValue, text, readonly);
        Settings.set(setting);
        Settings.publish(setting);
    }
    public static create(   name: string,
                            label: string,
                            value: SettingValue | undefined,
                            defaultValue: SettingValue,
                            text: string,
                            readonly: boolean): Setting {
        if (value) {
            return  {name, label, value, defaultValue, text, readonly};
        } else {
            return {name, label, value: defaultValue, defaultValue, text, readonly};

        }

    }
    public static get(name: string): Setting {
        const setting =  Settings.map.get(name);
        if (setting) {
            return setting;
        } else {
            throw Error(name);
        }
    }
    public static toNum(setting: Setting): number {
        return Number(setting.value);
    }
    public toString(setting: Setting): string {
        if (typeof setting.value === 'number') {
            return setting.value.toString();
        } else {
            return setting.value;
        }

    }
    public static has(name: string): boolean {
        return Settings.map.has(name);
    }
    public static set(setting: Setting) {
        Settings.map.set(setting.name, setting);
        log.info ('Settings.set: ' + JSON.stringify(setting));
    }
    public static update(name: string, value: SettingValue, callback: (updated: boolean) => void) {
        const setting = Settings.get(name);
        if (setting && !setting.readonly) {
            setting.value = value;
            log.info('Settings.update: setting ' + name + ' has new value:' + setting.value);
            if (name === Settings.SHARED_ACCESS_KEY) {
                conf.saveSharedKey(value.toString());
            }
            callback(true);
            this.publish(setting);
        } else {
            log.error('Settings.update: Cannot update readonly setting' + name + ' to ' + value);
            callback(false);
        }
    }

    public static forEach(callbackfn: (setting: Setting) => void) {
        Settings.map.forEach(callbackfn);
    }
}

