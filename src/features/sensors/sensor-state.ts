import { log } from '../../core/logger';
import { SensorAttributes } from './sensor-attributes';
import { SensorData } from './sensor-data';

import { Setting, Settings  } from '../../core/settings';

export interface FilterConfig {
    resolution?: number;
    maxTimeDiff?: number;
    ports?: number[];
}

export interface SensorDataListener {
    publish: (sensor: SensorData) => void;
    filter?: FilterConfig;
}
export class Sensor {
    public attr: SensorAttributes;
    public a: SensorData;
    public b: SensorData;
    public latest: SensorData;
    updateError: boolean = false;
    reportTime: number = 0;
}
interface SensorError {
    [port: number]: boolean;
}
export class SensorState {
    protected sensors: Sensor[] = [];
    protected updateSensorError = false;
    protected sensorDataListeners: SensorDataListener[] = [];

    constructor(protected defaultAttr: SensorAttributes ) {
           Settings.onChange(Settings.SERIAL_NUMBER, this.SNChanged.bind(this));
    }

    public getAttr(port: number): SensorAttributes {
        return this.sensors[port].attr;
    }

    public setAttr(port: number, attr: SensorAttributes): void {
        this.sensors[port].attr = attr;
    }

    public maxSampleRate(): number {
        const maxSampleRates = this.sensors.map((s) => s.attr.maxSampleRate);
        return  Math.max(...maxSampleRates);
    }

    public getSensorData(): SensorData[] {
        const sensorData: SensorData[] = [];
        for (const sensor of this.sensors) {
            sensorData.push(sensor.latest);
        }
        return sensorData;
    }
    public addSensorDataListener(onSensorDataReceived: (sensor: SensorData) => void, filter?: FilterConfig): void {
        this.sensorDataListeners.push ({publish: onSensorDataReceived, filter});
    }
    private SNChanged(setting: Setting) {
        const sn = setting.value.toString();
        this.sensors.forEach((s) => {
            const parts = s.attr.SN.split('--');
            if (parts[1] !== '') {
                s.attr.SN = sn + '--' + parts[1];
            } else {
                s.attr.SN = sn;
            }

        });
        log.info('SensorState.SNChanged to ' + sn);
    }
    private round(data: SensorData, resolution: number): number {
        const multiplier = Math.pow(10, resolution || 0);
        return Math.round(data.getValue() * multiplier) / multiplier;
    }
    private valueDiff(sensorData: SensorData, previousData: SensorData, resolution: number): boolean {
        const valueDiff =  Math.abs(this.round(sensorData, resolution) - this.round(previousData, resolution));
        return valueDiff > 0;
    }

    private timeDiff(sensorData: SensorData, previousData: SensorData, maxTimeDiff: number): boolean {
        const timeDiff = sensorData.timestamp() - previousData.timestamp();
        return timeDiff > maxTimeDiff;
    }
    private filterPort(sensorData: SensorData, filter: FilterConfig): boolean {
       return filter.ports? filter.ports.find(port => port === sensorData.getPort()) !== undefined: true;
    }
    private updateSensorDataListeners(sensorData: SensorData, previousData: SensorData) {
        let published: boolean = false;
        for (const listener of this.sensorDataListeners) {
            if (!listener.filter) {
                listener.publish(sensorData);
                published = true;
            } else if (this.filterPort(sensorData, listener.filter) &&
                        listener.filter.resolution &&
                this.valueDiff(sensorData, previousData, listener.filter.resolution) && sensorData.valid()) {
                listener.publish(sensorData);
                published = true;
            } else if (this.filterPort(sensorData, listener.filter) &&
                    listener.filter.maxTimeDiff && sensorData.valid() &&
                    this.timeDiff(sensorData, previousData, listener.filter.maxTimeDiff)) {
                listener.publish(sensorData);
                published = true;
            } else if (this.filterPort(sensorData, listener.filter)) {
                listener.publish(sensorData);
                published = true;
            }
        }
        if (published) {
            log.debug('SensorState.updateSensorDataListeners: Sensor data published to listener(s)');
        }
    }
    protected updateSensor(port: number, sampleValue: number) {
        const m = 'SensorState.updateSensor: ';
        if (this.sensors !== null) {
            const sensor: Sensor | undefined = this.sensors.find(s => s.latest.getPort() === port);
            if (sensor) {
                this.updateSensorError = false;
                if (sensor.latest === sensor.a) {
                    sensor.b.setValue(sampleValue);
                    sensor.latest = sensor.b;
                    this.updateSensorDataListeners(sensor.latest, sensor.a);
                } else {
                    sensor.a.setValue(sampleValue);
                    sensor.latest = sensor.a;
                    this.updateSensorDataListeners(sensor.latest, sensor.b);
                }
                if (sensor.updateError) {
                    sensor.updateError= false;
                    sensor.reportTime = sensor.latest.timestamp();
                    log.info(m + 'Sensor updated, port=' + port + ', sampleValue=' + sampleValue);
                } else if (sensor.latest.timestamp() - sensor.reportTime > 60000) {
                    sensor.reportTime = sensor.latest.timestamp();
                    log.info(m + 'Sensor updated, port=' + port + ', sampleValue=' + sampleValue);
                }
            } else {
                if (!this.updateSensorError) {
                    this.updateSensorError = true;
                    log.error(m + 'Undefined port=' + port + ', sampleValue=' + sampleValue);
                }
            }
        } else {
            if (!this.updateSensorError) {
                this.updateSensorError = true;
                log.error('SensorState.updateSensor: no sensors, port=' + port + ', sampleValue=' + sampleValue);
            }
        }
    }
    // USe connectSensors to mimic a physical device where sensors can be plugged in different ports
    // and where all sensors have the same category.
    protected connectSensors(ports: number[]) {
        if (this.sensors.length === 0) {
            this.sensors = new Array<Sensor>(ports.length);
            for (let port = 0; port < ports.length; port++) {
                const a = new SensorData(ports[port]);
                const b = new SensorData(ports[port]);
                const latest = b;
                this.sensors[port] = { attr: this.defaultAttr, a, b, latest, updateError: false, reportTime: 0 };
            }
        }
    }
    updateError: boolean = false;
    reportTime: number = 0;
    // Don't call addSensor and connectSensor in the same inherited state.
    // Use addSensor when the port no has no particular meaning oth than separating
    // sensors on the same device, e.g. Ruuvi tags.
    protected connectSensor(attr: SensorAttributes) {
        const port = this.sensors.length;
        const a = new SensorData(port);
        const b = new SensorData(port);
        const latest = b;
        this.sensors.push ({ attr, a, b, latest, updateError: false, reportTime: 0 });
    }
}
