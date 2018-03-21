import HID = require('node-hid');
import { SensorState } from './sensor-state';
export declare class DeviceConfig {
    vendorId: number;
    productId: number;
    product: string;
    interface: number;
}
export declare function isTemperGold(device: HID.Device): boolean;
export declare function isTemper8(device: HID.Device): boolean;
export declare class USBSensorManager {
    private static devices;
    private static sensorStates;
    static getSensorStates(): SensorState[];
    static factory(): void;
}