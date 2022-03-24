import ruuvi from 'node-ruuvitag';
import { log } from '../../core/logger';
import { Setting, Settings } from '../../core/settings';
import { SensorAttributes } from '../sensors/sensor-attributes';
import { SensorLog } from '../sensors/sensor-log';
import { Category, sensorLogService } from '../sensors/sensor-log-service';

import { RuuviData, RuuviData5 } from './ruuvi-data';
import { RuuviSensorState } from './ruuvi-sensor-state';

export interface PeripheralData {
    id: string;
    address: string;
    addressType: string;
    connectable: boolean;
}
interface Peripheral extends PeripheralData {
    on(type: 'updated', listener: (data: RuuviData) => void): void;
    on(type: 'error', listener: (raw: unknown) => void): void;
}
export interface TagStatus {
    dataFormat: number;
    rssi: number;
    battery: number;
    txPower: number;
    mac: string;
}
export interface Tag {
    state: RuuviSensorState;
    // log: SensorLog;
    data: PeripheralData;
    status: TagStatus;
}
export interface Tags {
    [index: string]: Tag;
}
export async function init() {
    log.info('ruuvi.initRuuvi');

    ruuvi.on('found', (peripheral: Peripheral) => {
        log.info('Found RuuviTag=: ' + JSON.stringify(peripheral, undefined, 2));
        const tag = createTag(peripheral);
        SensorLog.createSensorLog(tag.state);
    });
    ruuvi.on('warning', (message: any) => {
        log.error('ruuvi.ruuvi.on(warning): ' + JSON.stringify(message));
    });
    ruuvi.on('error', (message: any) => {
        log.error('ruuvi.ruuvi.on(error): ' + JSON.stringify(message));
    });
}
export function getRuuviTags(): string[] {
    const ids: string[] = [];
    Object.keys(tags).map(key => ids.push(key));
    return ids;
}
function RuuviAttr(tag: Tag, category: Category): SensorAttributes {
    const sn = Settings.get(Settings.SERIAL_NUMBER).value.toString();
    const ruuviSN = sn + '--' + tag.data.id;
    const attr: SensorAttributes = new SensorAttributes(
        ruuviSN,
        'Ruuvi Tag:',
        category,
        2,
        2,
        1);
    return attr;
}
const tags: Tags = {};
function createTag(peripheral: Peripheral): Tag {
    const state = new RuuviSensorState();
    const status: TagStatus = {dataFormat: 0, rssi: 0, battery: 0, txPower: 0, mac: peripheral.address};
    const tag = {
        state, // log: sensorLog,
        data: peripheral as PeripheralData,
        status,
    };
    tags[peripheral.id] = tag;

    // never change the order
    state.addSensor(RuuviAttr(tag, Category.Temperature));
    state.addSensor(RuuviAttr(tag, Category.Humidity));
    state.addSensor(RuuviAttr(tag, Category.rssi));
    state.addSensor(RuuviAttr(tag, Category.MovementCounter));

    peripheral.on('updated', (raw: RuuviData)  => {
        if (isRuuviData5Valid(raw)) {
            const data = raw as RuuviData5;
            tags[tag.data.id].status = {
                dataFormat: data.dataFormat,
                rssi: data.rssi,
                battery: data.battery,
                txPower: data.txPower,
                mac: data.mac,
            };
            tags[peripheral.id].state.update(data);
        } else {
            log.error('ruuvi-tags.createPeripheral.invalid Ruuvi Data=' + JSON.stringify(raw));
        }
    });
    peripheral.on('error', (data: any)  => {
        log.error('ruuvi-tag.createPeripheral.on(error): ' + JSON.stringify(data));
    });
    return tag;
}
function isObject(raw: unknown) {
    return typeof raw === 'object' && raw !== null;
}
function isRuuviData5Valid(raw: unknown) {
    let valid = isObject(raw);
    if (valid) {
        const data = raw as Partial<RuuviData5>;
        valid = valid
        && !!data.dataFormat && data.dataFormat === 5;
    }
    return valid;
}
