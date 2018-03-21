﻿
import { SensorState } from './sensor-state';
import { ReportParser } from './usb-controller';


// Temper8 parser understands HID reports from Temper8 devices
// Independent of USB lib used.

export class Temper8 extends SensorState implements ReportParser {

    // Track what sensor we should request value from next time
    protected nextSensor: number = 0;

    // Interface methods implementation

    public initReport(): number[][] {
        this.nextSensor = 0;
        return [this.usedPortsRequest(), this.temperatureRequest(this.nextSensor)];
    }
    // This function parses all input reports and check what to do
    // We are interested in two types of data from the device: which ports are used and
    // the temperature of the sensors connected.
    public parseInput(data: number[]): number[] {
        try {
            console.log('+++ Temper8.parseInput:', JSON.stringify(data));
            if (this.matchUsedPorts(data)) {
                const response = this.temperatureRequest(this.sensors[this.nextSensor].getPort());
                this.nextSensor += 1;
                return response;

            } else if (this.matchTemperature(data)) {
                console.log('+++ Temper8.matchTemperature:', JSON.stringify(data));
                if (this.nextSensor < this.sensors.length) {
                    const response = this.temperatureRequest(this.sensors[this.nextSensor].getPort());
                    this.nextSensor += 1;
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
                console.error('--- Temper8.matchCheckFF: restart?');
                // This indicates fault device
                // Don't know whether there is a way to recover
                // Maybe restarting the device is necessary.
                throw Error('--- Temper8.matchCheckFF');
            }
        } catch (e) {
            console.log(e);
        }
        return [];
    }

    // Temper 8 specific methods
    // Poll used ports
    private usedPortsRequest(): number[] {
        return [0x01, 0x8A, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00];
    }
    private  matchUsedPorts(data: number[]): boolean {
        // Make sure the input report states sensors
        // connected to the this. These hex values were found by using using USBlyzer
        // I.e. they might be different on your Device device

        if (data.length === 8
            && data[0] === 0x8A
            && data[1] === 0x08
            && data[2] === 0x01
            && data[3] === 0x01) {

            // Byte 4 contains no of sensors and
            // Byte 5 contains a bit array of connected sensors
            this.connectSensors(data[4], data[5]);
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
            console.log('+++ matchTemperature, data: %d', JSON.stringify(data));
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