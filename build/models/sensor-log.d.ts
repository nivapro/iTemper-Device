import { SensorAttributes } from '../models/sensor-attributes';
import { FilterConfig, SensorState } from '../models/sensor-state';
export interface LogginService {
}
export declare class SensorLog {
    private attr;
    private state;
    private timestamp;
    private logging;
    private MAX_TIME_DIFF;
    private dataFilter;
    private axios;
    private socket;
    private open;
    constructor(attr: SensorAttributes, state: SensorState);
    getAttr(): SensorAttributes;
    getState(): SensorState;
    getFilter(): FilterConfig;
    islogging(): boolean;
    startLogging(filter?: FilterConfig): void;
    stopLogging(): void;
    private onSensorDataReceived;
    private onMonitor;
}
