import { log } from './../logger';
import { SensorAttributes } from './sensor-attributes';
import { SensorData } from './sensor-data';

export interface FilterConfig {
    resolution?: number;
    maxTimeDiff?: number;
    ports?: number[];
}

export interface SensorDataListener {
    publish: (sensor: SensorData) => void;
    filter?: FilterConfig;
}
export class Sensor { public p: SensorData; public s: SensorData;}
export class SensorState {
    protected attr: SensorAttributes;
    protected sensors: Sensor[] = [];

    protected sensorDataListeners: SensorDataListener[] = [];

    constructor(attr: SensorAttributes) {
        this.attr = attr;
    }

    public getAttr(): SensorAttributes {
        return this.attr;
    }

    public setAttr(attr: SensorAttributes): void {
        this.attr = attr;
    }

    public maxSampleRate(): number {
        return this.attr.maxSampleRate;
    }

    public getSensorData(): SensorData[] {
        const sensorData: SensorData[] = [];
        for (const sensor of this.sensors) {
            sensorData.push(sensor.s);
        }
        return sensorData.slice();
    }
    public addSensorDataListener(onSensorDataReceived: (sensor: SensorData) => void, filter?: FilterConfig): void {
        this.sensorDataListeners.push ({publish: onSensorDataReceived, filter});
    }
    private round(data: SensorData, resolution: number): number {
        const multiplier = Math.pow(10, resolution || 0);
        return Math.round(data.getValue() * multiplier) / multiplier;
    }
    private valueDiff(sensorData: SensorData, previousData: SensorData, resolution: number): boolean {
        const valueDiff =  Math.abs(this.round(sensorData, resolution) - this.round(previousData, resolution));
        log.debug('value diff: ' + valueDiff);
        return valueDiff > 0;
    }

    private timeDiff(sensorData: SensorData, previousData: SensorData, maxTimeDiff: number): boolean {
        const timeDiff = sensorData.timestamp() - previousData.timestamp();
        log.debug('Time diff: ' + timeDiff);
        return timeDiff > maxTimeDiff;
    }
    private filterPort(sensorData: SensorData, filter: FilterConfig): boolean {
       return filter.ports? filter.ports.find(port => port === sensorData.getPort()) !== undefined: true;
    }
    private updateSensorDataListeners(sensorData: SensorData, previousData: SensorData) {
        log.debug('updateSensorDataListeners');
        for (const listener of this.sensorDataListeners) {
            log.debug('updateSensorDataListeners, filter:' + JSON.stringify(listener.filter));
            if (!listener.filter) {
                log.debug('updateSensorDataListeners, no filter found');
                listener.publish(sensorData);
                Object.assign(previousData, sensorData);
                return;

            } else if (this.filterPort(sensorData, listener.filter) &&
                        listener.filter.resolution &&
                this.valueDiff(sensorData, previousData, listener.filter.resolution) && sensorData.valid()) {

                log.debug('updateSensorDataListeners, publish.filter.resolution');
                listener.publish(sensorData);
                Object.assign(previousData, sensorData);

            } else if (this.filterPort(sensorData, listener.filter) &&
                    listener.filter.maxTimeDiff && sensorData.valid() &&
                    this.timeDiff(sensorData, previousData, listener.filter.maxTimeDiff)) {
                log.debug('updateSensorDataListeners, publish.filter.maxTimeDiff');
                listener.publish(sensorData);
                Object.assign(previousData, sensorData);

            } else if (this.filterPort(sensorData, listener.filter)) {
                log.debug('updateSensorDataListeners, publish.filter.port');
                listener.publish(sensorData);
                Object.assign(previousData, sensorData);
            }
        }
    }
    protected updateSensor(port: number, temperature: number) {
        if (this.sensors !== null) {
            const sensor: Sensor | undefined = this.sensors.find(s => s.s.getPort() === port);
            if (sensor) {
                sensor.s.setValue(temperature);
                this.updateSensorDataListeners(sensor.s, sensor.p);
                log.debug('SensorState.updateSensor, port: ' + port + ', temperature ' + temperature);
            } else {
                log.error('*** SensorState.updateSensor, undefined, port: ' + port + ', temperature ' + temperature);
            }
        } else {
            log.error('*** SensorState.updateSensor, no sensors, port: ' + port + ', temperature ' + temperature);
        }
    }

    protected connectSensors(ports: number[]) {
        log.debug('--- connectSensors, ports: ' + JSON.stringify(ports));
        if (this.sensors.length === 0) {

            this.sensors = new Array<Sensor>(ports.length);

            for (let port = 0; port < ports.length; port++) {
                this.sensors[port] = { p: new SensorData(port), s: new SensorData(port) };
            }
        }

    }
}
