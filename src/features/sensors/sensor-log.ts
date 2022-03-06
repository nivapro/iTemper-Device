import { stringify } from '../../core/helpers';
import { log } from '../../core/logger';
import { Settings } from '../../core/settings';

import { SensorData } from './sensor-data';
import { Descriptor, ISensorLogService, SensorLogError, sensorLogService } from './sensor-log-service';
import { FilterConfig, SensorState } from './sensor-state';

enum LogStatus { Unregistered, Registering, Registered}

export interface Sample {
    date: number;
    value: number;
}
export interface SensorDescriptor {
    SN: string;
    port: number;
}
export interface SensorLogData {
    desc: SensorDescriptor;
    samples: Sample[];
}
export class SensorLog {
    private static loggers: SensorLog[] = [];
    private logging: boolean = false;
    private status: LogStatus = LogStatus.Unregistered;
    private onDataReceivedError: boolean = false;
    private registerSensorError: boolean = false;
    private MAX_TIME_DIFF = 60_000;
    private dataFilter: FilterConfig= {
        resolution: 1,
        maxTimeDiff: this.MAX_TIME_DIFF};

    constructor(private state: SensorState, private logService: ISensorLogService) {
        this.logging = false;
        this.state.addSensorDataListener(this.onDataReceived.bind(this));
        this.state.addSensorDataListener(this.onMonitor.bind(this));
    }
    public static createSensorLog(sensorState: SensorState) {
        const sensorLog = new SensorLog(sensorState, sensorLogService);
        SensorLog.loggers.push(sensorLog);
        sensorLog.startLogging();
    }
    public static getLoggers(): SensorLog[] {
        return SensorLog.loggers;
    }
    public getState(): SensorState {
        return this.state;
    }
    public getFilter(): FilterConfig {
        return this.dataFilter;
    }
    public islogging(): boolean {
        return this.logging;
    }
    public startLogging(filter?: FilterConfig): void {
        log.info('sensor-log.startLogging: ' + JSON.stringify(filter));
        if (filter) {
            this.dataFilter = filter;
        }
        this.logging = true;
    }
    public stopLogging(): void {
        log.info('sensor-log.stopLogging');
        this.logging = false;
    }
    private onDataReceived(data: SensorData): void {
        const m = 'sensor-log.onDataReceived: ';
        const self = this;
        if (this.status !== LogStatus.Registered) {
            this.registerSensor(data);
        } else {
            const desc = { SN: this.state.getAttr(data.getPort()).SN, port: data.getPort()};
            const samples = [{date: data.timestamp(), value: data.getValue()}];
            const sensorLogData: SensorLogData = { desc, samples };
            this.logService.writeSensorLog(sensorLogData);
            const lastTime = this.state.getLastTime(data.getPort());
            const interval = Settings.toNum(Settings.get(Settings.POLL_INTERVAL));
            if (this.logging && (Date.now() - lastTime) > interval) {
                this.logService.PostSensorLog(sensorLogData)
                .then((desc: Descriptor) => {
                    if (self.onDataReceivedError) {
                        self.onDataReceivedError = false;
                        log.info(m + 'sensor data posted, desc=' + JSON.stringify(desc));
                    }
                })
                .catch((error: SensorLogError) => {
                    if (!self.onDataReceivedError) {
                        self.onDataReceivedError = true;
                        log.error(m + stringify(error));
                    }
                    if (error.status === 404) {
                        self.status = LogStatus.Unregistered;
                        self.registerSensor(data);
                    }
                });
            } else {
                const debug = {status: LogStatus[this.status], logging: this.logging, data };
                log.debug(m + stringify(debug));
            }

        }
    }
    private registerSensor(data: SensorData): void {
        const m = 'sensor-log.registerSensor: ';
        if (this.status !== LogStatus.Registered) {
            const attr = this.state.getAttr(data.getPort());
            const desc = { SN: attr.SN, port: data.getPort()};
            const registration = { desc, attr };
            log.debug(m + 'desc=' + stringify(desc));
            const self = this;
            self.status = LogStatus.Registering;
            this.logService.registerSensor(registration)
            .then (function() {
                self.status = LogStatus.Registered;
                self.registerSensorError = false;
                log.info(m + 'sensor registered, desc=' + stringify(desc));
            })
            .catch(function(error: SensorLogError) {
                if (!self.registerSensorError) {
                    self.registerSensorError = true;
                    log.error(m + stringify(error));
                }
                setTimeout(()=> self.registerSensor(data), 5_000);
            });
        }
    }
    private onMonitor(data: SensorData): void {
        const desc = { SN: this.state.getAttr(data.getPort()).SN, port: data.getPort()};
        const samples = [{date: data.timestamp(), value: data.getValue()}];
        const sensorLog = { desc, samples };
        this.logService.writeSensorLog(sensorLog);
    }
}
