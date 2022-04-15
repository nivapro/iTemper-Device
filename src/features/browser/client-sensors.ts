import { SensorAttributes } from '../sensors/sensor-attributes';
import { registerReceiveCommand, registerOnOpenCommand, sendCommand, setConnectionStatus } from './client-connection'; 
enum Category {
    Temperature = 'Temperature',
    AbsoluteHumidity = 'AbsoluteHumidity',
    RelativeHumidity = 'RelativeHumidity',
    WindSpeed = 'WindSpeed',
    rssi = 'rssi',
    Humidity = 'Humidity',
    AirPressure = 'AirPressure',
    AccelerationX = 'AccelerationX',
    AccelerationY = 'AccelerationY',
    AccelerationZ = 'AccelerationZ',
    Battery = 'Battery',
    TxPower = 'TxPower',
    MovementCounter = 'MovementCounter',
}
const sensorsSection = 'sensorsSection';
const sensorMonitor = 'sensorMonitor';

export function init() {
    addMonitorBtn();
    registerReceiveCommand('sensors', receiveSensors);
    registerOnOpenCommand('getSensors');
}
function addMonitorBtn() {
    const monitorBtn = document.getElementById(sensorMonitor);
    on('click', monitorBtn,  ()=> { monitor();});
} 
function on(event: string, element: HTMLElement | null, fn: () => void) {
    if (element) {
        console.log('on %s: add event listener', event);
        element.addEventListener(event, fn);
    }
}
export interface SensorDescription {
    SN: string;
    port: number;
}
export interface SensorSample {
    value: number;
    date: number;
}
export interface SensorLog {
    desc: SensorDescription;
    attr: SensorAttributes;
    samples: SensorSample[];
}
const sensors: SensorLog[] = [];

function sensorName(desc: SensorDescription): string {
    return desc.SN.replace('--', '/') + '/' + desc.port;
}
function sensorId(desc: SensorDescription): string {
    const sn = desc.SN.replace(' ', desc.SN);
    const id = desc.SN.replace(' ', desc.SN) + '-' + desc.port;
    return id;
}
let isMonitoring = false;
function setMonitoringButton() {
    const button = document.getElementById(sensorMonitor);
    if (!button) { return; }
    if (isMonitoring) {
        button.innerHTML = 'Stop monitor';
        button.classList.add('isMonitoring');
    } else {
        button.innerHTML = 'Start Monitor';
        button.classList.remove('isMonitoring');
    }
}
function startMonitor(sensors: SensorLog[]) {
    isMonitoring = true;
    setConnectionStatus(isMonitoring);
    setMonitoringButton();
    const command = 'startMonitor';
    const data: any = [];
    for (const sensor of sensors) {
        data.push(sensor.desc);
    }
    sendCommand(command, data);
}
function stopMonitor(sensors: SensorLog[]) {
    isMonitoring = false;
    setConnectionStatus(isMonitoring);
    setMonitoringButton();
    const command = 'stopMonitor';
    const data: any = [];
    for (const sensor of sensors) {
        data.push(sensor.desc);
    }
    sendCommand(command, data);
}
export function receiveSensors(data: unknown) {
    const sensors = data as SensorLog[]; //TODO: Validate
    const section = document.getElementById(sensorsSection);
    for (const sensor of sensors) {
        const article = document.createElement('article');
        const heading = document.createElement('h3');

        heading.id = sensorId(sensor.desc) + '-value';
        article.appendChild(heading);

        const desc = document.createElement('p');
        desc.id = sensorId(sensor.desc);
        article.appendChild(desc);
        if (section) {
            section.appendChild(article);
        }
    }
    if (!isMonitoring) {
        startMonitor(sensors);
    }
    log(sensors);
}
function unit(category: Category): string {
    switch (category) {
        case Category.AbsoluteHumidity || Category.RelativeHumidity || Category.Humidity:
            return ' \%';
        case Category.Temperature:
            return ' °C';
         default:
            return '';
    }
}
function categoryName(category: Category): string {
    switch (category) {
        case Category.AbsoluteHumidity:
            return 'Absolute Humidity';
        case Category.RelativeHumidity:
            return 'Relative Humidity';
        case Category.Humidity:
            return 'Humidity';
        case Category.Temperature:
            return 'Temperature';
        case Category.rssi:
            return 'RSSI';
        case Category.MovementCounter:
            return 'Movement Counter';
         default:
            return category.toString();
    }
}
let logTimer: any;
function log(data: unknown) {
    const sensorData = data as SensorLog[]
    for (const sensor of sensorData) {
        const log = document.getElementById(sensorId(sensor.desc) + '-value');
        if (log) {
            const date = new Date(sensor.samples[0].date);
            const value = sensor.samples[0].value;
            log.innerHTML = categoryName(sensor.attr.category) + ': ' + value + unit(sensor.attr.category);
        }
        const desc = document.getElementById(sensorId(sensor.desc));
        if (desc) {
            const date = new Date(sensor.samples[0].date);
            const value = sensor.samples[0].value;
            desc.innerHTML = 'by ' + sensorName(sensor.desc)  + ': ' +
                date.toLocaleDateString() + ', ' + date.toLocaleTimeString() + '. model: ' + sensor.attr.model;
        }
        clearTimeout(logTimer);
        logTimer = setInterval(clearSensorValue, 3000);
    }
}
function monitor() {
    if (isMonitoring) {
        stopMonitor(sensors);

    } else {
        startMonitor(sensors);
    }
}
function clearSensorValue() {
    for (const sensor of sensors) {
        const sampleDate = sensor.samples[0].date;
        if (Date.now() - sampleDate > 60_000) {
            const sensorValue = document.getElementById(sensorId(sensor.desc));
            if (sensorValue) {
                sensorValue.innerHTML = 'No sensor data received last 60 seconds';
            }
        }
    }
}
