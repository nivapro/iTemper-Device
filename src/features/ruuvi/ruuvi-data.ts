
export interface RuuviData5 {
    dataFormat: number; // check === 5
    rssi: number;
    temperature: number;
    humidity: number;
    pressure: number;
    accelerationX: number;
    accelerationY: number;
    accelerationZ: number;
    battery: number;
    txPower: number;
    movementCounter: number;
    measurementSequenceNumber: number;
    mac: string; // "F6:93:9B:47:10:75"
}
export interface RuuviData2or4 {
    url: string;
    dataFormat: number;
    rssi: number;
    humidity: number;
    temperature: number;
    pressure: number;
    eddystoneId: string;
}
export type RuuviData = RuuviData2or4 | RuuviData5;
