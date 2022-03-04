
import { log } from '../../core/logger';
import { Category } from '../sensors/sensor-log-service';

import { RuuviData5 } from './ruuvi-data';

import { Setting, Settings} from '../../core/settings';
import { SensorAttributes, SensorCategory } from '../sensors/sensor-attributes';
import { SensorState } from '../sensors/sensor-state';


export class RuuviSensorState extends SensorState {
    // Todo: Fix constructor so we do not need defaultAttr dummy
    static defaultAttr: SensorAttributes = new SensorAttributes(
        '', '', SensorCategory.Temperature, 2, 2, 1);

    constructor() {
        super(RuuviSensorState.defaultAttr);

        Settings.onChange(Settings.SERIAL_NUMBER, (setting: Setting) => {
            this.sensors.forEach((s) => s.attr.SN = setting.value.toString());
            log.info('Ruuvi.settingChanged: SERIAL_NUMBER=' + setting.value.toString());
        });
    }
    public addSensor(attr: SensorAttributes) {
        this.connectSensor(attr);
    }
    public findPort(category: Category): number {
        let port = -1;
        this.sensors.forEach((s, index) => {
            if (s.attr.category === category) {
                port = index;
                return port;
            }
        });
        log.debug('ruuvi-sensor-state.findPort, port=' + category.toString() +':'+ port);
        return port;
    }
    public update(data: RuuviData5) {
        log.debug('ruuvi-sensor-state.update, data=' + JSON.stringify(data, undefined, 2));
        this.sensors.forEach((sensor, port) => {
            switch (sensor.attr.category) {
                case Category.AbsoluteHumidity:
                    this.updateSensor(port, data.humidity);
                    break;
                case Category.AirPressure:
                    this.updateSensor(port, data.pressure);
                    break;
                case Category.AccelerationX:
                    this.updateSensor(port, data.accelerationX);
                    break;
                case Category.AccelerationY:
                    this.updateSensor(port, data.accelerationY);
                    break;
                case Category.AccelerationZ:
                    this.updateSensor(port, data.accelerationZ);
                    break;
                case Category.Humidity:
                    this.updateSensor(port, data.humidity);
                    break;
                case Category.RelativeHumidity:
                    this.updateSensor(port, data.humidity);
                    break;
                case Category.Temperature:
                    this.updateSensor(port, data.temperature);
                    break;
            }
        });
    }
}
