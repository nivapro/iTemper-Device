
import { log } from '../../core/logger';
import {Setting, Settings} from '../../core/settings';
import { SensorAttributes, SensorCategory } from './sensor-attributes';
import { SensorState } from './sensor-state';
import { USBConfig, USBReporter } from './usb-device';

// Temper Gold parser understands HID reports from Temper Gold devices
// Independent of USB lib used.

export class TemperGold extends SensorState implements USBReporter {
    // Interface methods implementation

    private readReportError = false;
    private readReportWarning = false;
    constructor(config: USBConfig) {
        super(new SensorAttributes (
            TemperGold.SN(config),
            TemperGold.model(config),
            SensorCategory.Temperature,
            2.0, 1, 1));
        this.connectSensors([0]);
        Settings.onChange(Settings.SERIAL_NUMBER, (setting: Setting) => {
            this.sensors.forEach((s) => s.attr.SN = setting.value.toString());
            log.info('TemperGold.settingChanged: SERIAL_NUMBER=' + setting.value.toString());
        });
    }

    private static model(config: USBConfig): string {
        return config.manufacturer || '' + config.product || 'Temper Gold';
    }

    private static SN(config: USBConfig): string {
        return config.serialNumber || Settings.get(Settings.SERIAL_NUMBER).value.toString();
    }
    public initWriteReport(): number[][] {
        return [this.temperatureRequest()];
    }
    // This function parses all input reports and checks what to do
    public readReport(data: number[]): number[] {
        try {
            if (!this.matchTemperature(data) && !this.readReportWarning) {
                this.readReportWarning = true;
                log.warning('TemperGold.readReport: no match data=', data);
            } else {
                this.readReportWarning = false;
            }
            this.readReportError = false;
        } catch (e) {
            if (!this.readReportError) {
                this.readReportError = true;
                log.error('TemperGold.readReport: error=', e);
            }
        }
        return [];
    }

    // Poll temperature and update sensor data

    // byte string for requesting the temperature from Temper Gold
    private temperatureRequest(): number[] {
        return [0x01, 0x80, 0x33, 0x01, 0x00, 0x00, 0x00, 0x00];
    }

    // This methods update sensor state if data contains the temperature byte string
    private  matchTemperature(data: number[]) {

        // Make sure the input report is a temperature report,
        // These hex values were found by analyzing USB using USBlyzer.
        // I.e. they might be different on your Device device
        if (data.length === 8
            && data[0] === 0x80
            && data[1] === 0x02) {
            const msb: number = data[2];
            const lsb: number = data[3];
            const temperatureCelsius: number = this.GetTemperature(msb, lsb);

            const port = 0;
            this.updateSensor(port, temperatureCelsius);
            return true;
        } else {
            return false;
        }
    }
    private  GetTemperature(msb: number, lsb: number): number {
        let temperature: number = 0.0;

        let reading: number = (lsb & 0xFF) + (msb << 8);

        // Assume positive temperature value
        let result: number = 1;

        if ((reading & 0x8000) > 0) {
            // Below zero
            // get the absolute value by converting two's complement
            reading = (reading ^ 0xffff) + 1;

            // Remember a negative result
            result = -1;
        }

        // The least significant bit is 2^-8 so we need to divide by 256 to get absolute temperature in Celsius
        // Then we multiply in the result to get whether the temperature is below zero degrees. We convert to
        // floating point in the process.
        temperature = result * reading / 256.0;

        return temperature;
    }
}
