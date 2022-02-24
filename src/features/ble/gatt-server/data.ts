import { log } from '../../../core/logger';
import { SensorData } from '../../sensors/sensor-data';

export interface DeviceName {
    name: string ;
}
export interface DeviceColor {
    color: string ;
}
export interface DeviceKey {
    key: string ;
}  
export interface DeviceData {
     name: string ;
     deviceID: string ;
     key: string;
     color?: string;
     statusTime?: number;
     uptime?: number;
}
export interface WiFiData {
     ssid: string;
     security: string;
     quality: number;
     channel: number;
}
export interface DeviceWiFiData {
     current: WiFiData;
     available: WiFiData[];
}
export interface DeviceState {
     deviceData: DeviceData;
     networks: DeviceWiFiData;
     sensors: SensorData[];
}
export interface DeviceData {
     name: string ;
     deviceID: string ;
     key: string;
     color?: string;
     statusTime?: number;
     uptime?: number;
}
export interface WiFiRequest {
    ssid: string;
    password: string;
}
export interface DeviceWiFiData {
     current: WiFiData;
     available: WiFiData[];
}
export interface DeviceState {
     deviceData: DeviceData;
     networks: DeviceWiFiData;
     sensors: SensorData[];
}
export function isObject(raw: unknown) {
    return typeof raw === 'object' && raw !== null;
}
export function isDeviceDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-characteristic-data.isDeviceDataValid - not an object');
    } else {
        const data = raw as Partial<DeviceData>;
        valid = valid
        && 'deviceID' in data && typeof data.deviceID === 'string'
        && 'name' in data && typeof data.name === 'string'
        && 'color' in data && typeof data.color === 'string'
        && 'key' in data && typeof data.key === 'string';
        if (!valid) {
            log.error('device-characteristic-data.isDeviceDataValid - not valid');
        }
    }
    return valid;
}
export function isDeviceNameValid(raw: unknown): boolean {
    const m = 'device-characteristic-data.isDeviceNameValid - ';
    let valid = isObject(raw);
    if (!valid) {
        log.error(m + 'not an object');
    } else {
        const data = raw as Partial<{name: string}>;
        valid = valid
        && 'name' in data && typeof data.name === 'string'
        if (!valid) {
            log.error(m + 'not valid');
        }
    }
    return valid;
}
export function isDeviceColorValid(raw: unknown): boolean {
    const m = 'device-characteristic-data.isDeviceColorValid - ';
    let valid = isObject(raw);
    if (!valid) {
        log.error(m + 'not an object');
    } else {
        const data = raw as Partial<{color: string}>;
        valid = valid
        && 'color' in data && typeof data.color === 'string'
        if (!valid) {
            log.error(m + 'not valid');
        }
    }
    return valid;
}
export function isDeviceKeyValid(raw: unknown): boolean {
    const m = 'device-characteristic-data.isDeviceKeyValid - ';
    let valid = isObject(raw);
    if (!valid) {
        log.error(m + 'not an object');
    } else {
        const data = raw as Partial<{key: string}>;
        valid = valid
        && 'key' in data && typeof data.key === 'string'
        if (!valid) {
            log.error(m + 'not valid');
        }
    }
    return valid;
}
export function isWiFiDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-characteristic-data.isWiFiDataValid - not an object');
    } else {
        const data = raw as Partial<WiFiData>;
        valid = valid
        && 'ssid' in data && typeof data.ssid === 'string'
        && 'security' in data && typeof data.security === 'string'
        if (!valid) {
            log.error('device-characteristic-data.isWiFiDataValid - not valid');
        }
    }
    return valid;
}
export function isWiFiDataArrayValid(raw: unknown): boolean {
    let valid = Array.isArray(raw);
    if (!valid) {
        log.error('device-characteristic-data.isWiFiDataArrayValid - not an array');
    } else {
        const data = raw as Partial<WiFiData[]>;
        data.forEach((network: unknown) => { valid = valid && isWiFiDataValid(network); });
    }
    if (!valid) {
        log.error('device-characteristic-data.isWiFiDataArrayValid - not valid');
    }
    return valid;
}
export function isWiFiRequestValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-characteristic-data.isWiFiRequestValid - not an object');
    } else {
        const data = raw as Partial<WiFiRequest>;
        valid = valid
        && 'ssid' in data && typeof data.ssid === 'string' && data.ssid.length > 0 && data.ssid.length < 33
        && 'password' in data && typeof data.password === 'string';
        if (!valid) {
            log.error('device-characteristic-data.isWiFiRequestValid - not valid');
        }
    }
    return valid;
}
export function isDeviceWiFiDataValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-characteristic-data.isDeviceWiFiDataValid - not an object');
    } else {
        const data = raw as Partial<DeviceWiFiData>;
        if ('current' in data) {
            valid = valid && isWiFiDataValid(data.current);
        }
        valid = valid
        && 'available' in data && Array.isArray(data.available);
        if (valid) {
            data.available?.forEach((network) => valid = valid && isWiFiDataValid(network));
        }
        if (!valid) {
            log.error('device-characteristic-data.isDeviceWiFiDataValid - not valid');
        }
    }
    return valid;
}
export function isDeviceStateValid(raw: unknown): boolean {
    let valid = isObject(raw);
    if (!valid) {
        log.error('device-characteristic-data.isDeviceStateValid - not an object');
    } else {
        const data = raw as Partial<DeviceState>;
        if ('deviceData' in data) {
            valid = valid && isDeviceDataValid(data.deviceData);
        }
        valid = valid
        && 'networks' in data && isDeviceWiFiDataValid(data.networks)
        if (!valid) {
            log.error('device-characteristic-data.isDeviceStateValid - not valid');
        }
    }
    return valid;
}
