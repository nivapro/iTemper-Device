
import { log } from '../../core/logger';
import {Setting, Settings} from '../../core/settings';
import { SensorAttributes, SensorCategory } from './sensor-attributes';
import { SensorState } from './sensor-state';
import { USBConfig, USBReporter } from './usb-device';



// Temper8 parser understands HID reports from Temper8 devices
// Independent of USB lib used.

export class Temper8 extends SensorState implements USBReporter {
    // Device has 8 ports, each of which can hold a 1-wire temperature sensor
    // The sensors are polled in sequence, starting from port 0 to port 7.
    // We do not know how many sensors are connected until we received the config
    // in a USB HID report
    private readError = false;
    constructor(config: USBConfig) {
        super(new SensorAttributes (
            Temper8.SN(config),
            Temper8.model(config),
            SensorCategory.Temperature,
            0.5, 1, 0.2));

        Settings.onChange(Settings.SERIAL_NUMBER, (setting: Setting) => {
            this.sensors.forEach((s) => s.attr.SN = setting.value.toString());
            log.info('Temper8.settingChanged: SERIAL_NUMBER=' + setting.value.toString());
        });
    }

    private static model(config: USBConfig): string {
        return config.manufacturer || '' + config.product || 'Temper 8';
    }

    private static SN(config: USBConfig): string {
        return config.serialNumber || Settings.get(Settings.SERIAL_NUMBER).value.toString();
    }


    // Track what sensor we should request value from next time
    protected nextSensor: number = 0;

    // Interface methods implementation

    public initWriteReport(): number[][] {
    // This starts the polling. First we ask the device about sensors attached configuration
    // We also request temperature from port zero (for the sake of it, unclear reason)
        this.nextSensor = 0;
        return [this.usedPortsRequest(), this.temperatureRequest(this.nextSensor)];
    }

    // This function parses all input reports and check what to do
    // We are interested in two types of data from the device: which ports are used and
    // the temperature of the sensors connected.
    public readReport(data: number[]): number[] {
        try {
            if (this.matchUsedPorts(data)) {
                const response = this.temperatureRequest(this.sensors[this.nextSensor].latest.getPort());
                this.nextSensor += 1;
                return response;

            } else if (this.matchTemperature(data)) {
                if (this.nextSensor < this.sensors.length) {
                    const response = this.temperatureRequest(this.sensors[this.nextSensor].latest.getPort());
                    this.nextSensor += 1;
                    if (this.readError) {
                        this.readError = false;
                        log.info('Temper8.readReport: Temperature request');
                    }
                    return response;

                } else {
                    this.nextSensor = 0;
                    return this.check03Request();
                }
            } else if (this.matchCheck03(data)) {
                return this.check05Request();

            } else if (this.matchCheck05(data)) {
                return this.check0DRequest();
            } else if (this.matchCheck0D(data)) {
                return [];
            } else if (this.matchCheckFF(data)) {
                // This indicates fault device
                // Don't know whether there is a way to recover
                // Maybe restarting the device is necessary.
                throw Error('Temper8.matchCheckFF, restart?');
            }
        } catch (e) {
            if (!this.readError) {
                this.readError = true;
                log.error(e);
            }
        }
        return [];
    }

    // Temper 8 specific methods
    // Poll used ports
    private usedPortsRequest(): number[] {
        return [0x01, 0x8A, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00];
    }

    private getUsedPorts(total: number, used: number): number[] {
        const usedPorts = new Array<number>(total);
        const bits: number[] = [0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80];

        let portIndex = 0;
        // Check the bit array for used ports, one bit at a time
        for (let bit = 0; bit < bits.length; bit++) {
            if ((used & bits[bit]) === bits[bit]) {
                const port = bit;
                usedPorts[portIndex] = port;
                portIndex += 1;
                }
        }
        return usedPorts;
    }
    private matchUsedPorts(data: number[]): boolean {
        // Make sure the input report states sensors
        // connected to the this. These hex values were found by using using USBlyzer
        // I.e. they might be different on your Device device

        if (data.length === 8
            && data[0] === 0x8A
            && data[1] === 0x08
            && data[2] === 0x01
            && data[3] === 0x01) {

            // Byte 4 contains no of sensors connected to Temper8 and
            // Byte 5 contains a bit array of ports used by the sensors
            this.connectSensors(this.getUsedPorts(data[4], data[5]));
            return true;
        } else {
            return false;
        }
    }
    // Poll temperature and update sensor data
    private temperatureRequest(port: number): number[] {
        return [0x01, 0x80, 0x01, 0x00, 0x00, port, 0x00, 0x00];
    }
    private  matchTemperature(data: number[]) {
        // get the temperature and update sensor value

        // Make sure the HID input report is a temperature report,
        // These hex values were found by analyzing USB using USBlyzer.
        // I.e. they might be different on your Device device
        // byte 4 contains the port number.
        if (data.length === 8
            && data[0] === 0x80
            && data[1] === 0x08
            && data[2] === 0x01) {
            const port: number = data[4];
            const msb: number = data[5];
            const lsb: number = data[6];
            const temperatureCelsius: number = this.GetTemperature(msb, lsb);

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

        // The east significant bit is 2^-4 so we need to divide by 16 to get absolute temperature in Celsius
        // Multiply in the result to get whether the temperature is below zero degrees and convert to
        // floating point
        temperature = result * reading / 16.0;

        return temperature;
    }
    // Poll checks
    private  check03Request() {
        return [0x01, 0x8A, 0x01, 0x03, 0x00, 0x00, 0x00, 0x00];
    }
    private  matchCheck03(data: number[]) {
        if (data.length === 8
            && data[0] === 0x8A
            && data[1] === 0x08
            && data[2] === 0x01
            && data[3] === 0x03) {
            return true;
        } else {
            return false;
        }
    }
    private check05Request() {
        return [0x01, 0x8A, 0x01, 0x05, 0x00, 0x00, 0x00, 0x00];
    }
    private  matchCheck05(data: number[]) {
        if (data.length === 8
            && data[0] === 0x8A
            && data[1] === 0x08
            && data[2] === 0x01
            && data[3] === 0x05) {
            return true;
        } else {
            return false;
        }
    }
    private  check0DRequest() {
        return [0x01, 0x8A, 0x01, 0x0D, 0x00, 0x00, 0x00, 0x00];
    }
    private  matchCheck0D(data: number[]) {
        if (data.length === 8
            && data[0] === 0x8A
            && data[1] === 0x08
            && data[2] === 0x01
            && data[3] === 0x0D) {
            return true;
        } else {
            return false;
        }
    }
    // private  checkFFRequest() {
    //     return [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];
    // }
    private  matchCheckFF(data: number[]) {
        if (data.length === 8
            && data[0] === 0xFF
            && data[1] === 0xFF
            && data[2] === 0xFF
            && data[3] === 0xFF) {
            return true;
        } else {
            return false;
        }
    }

}
