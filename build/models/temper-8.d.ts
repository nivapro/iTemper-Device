import { SensorState } from './sensor-state';
import { USBReporter } from './usb-device';
export declare class Temper8 extends SensorState implements USBReporter {
    constructor();
    protected nextSensor: number;
    initWriteReport(): number[][];
    readReport(data: number[]): number[];
    private usedPortsRequest;
    private getUsedPorts;
    private matchUsedPorts;
    private temperatureRequest;
    private matchTemperature;
    private GetTemperature;
    private check03Request;
    private matchCheck03;
    private check05Request;
    private matchCheck05;
    private check0DRequest;
    private matchCheck0D;
    private matchCheckFF;
}
