import persist from 'node-persist';
import ruuvi from 'node-ruuvitag';
import { conf } from '../../core/config';
import { log } from '../../core/logger';
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
    log: SensorLog;
    // sensors: Sensor[];
    data: PeripheralData;
    status: TagStatus;
}
export interface Tags {
    [index: string]: Tag;
}
const nextAvailablePortKey = 'nextAvailablePort';
export async function init() {
    log.info('ruuvi.initRuuvi');
    await persist.init({
        dir: conf.ITEMPER_PERSIST_DIR,
    });
    if (!persist.getItem(nextAvailablePortKey)) {
        persist.setItem(nextAvailablePortKey, 1); // TODO: we let USB has port zero;
    }
    ruuvi.on('found', (tag: Peripheral) => {
        log.info('Found RuuviTag=: ' + JSON.stringify(tag));
        createPeripheral(tag);
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
export function startLogging(tagID: string, category: Category) {
    const ports = [tags[tagID].state.findPort(category)];
    tags[tagID].log.startLogging({ports});
}
export function StopLogging(tagID: string, category: Category) {
    const ports = [tags[tagID].state.findPort(category)];
    tags[tagID].log.stopLogging();
}

function RuuviAttr(tag: Tag, category: Category): SensorAttributes {
    const attr: SensorAttributes = new SensorAttributes(
        tag.data.id,
        'Ruuvi Tag:',
        category,
        2,
        2,
        1);
    return attr;
}
const tags: Tags = {};
async function createPeripheral(peripheral: Peripheral) {
    const state = new RuuviSensorState();
    const sensorLog = new SensorLog(state, sensorLogService);
    const status: TagStatus = {dataFormat: 0, rssi: 0, battery: 0, txPower: 0, mac: peripheral.address};
    const tag = {
        state, log: sensorLog,
        data: peripheral as PeripheralData,
        status,
    };
    tags[peripheral.id] = tag;

    state.addSensor(RuuviAttr(tag, Category.Temperature));
    state.addSensor(RuuviAttr(tag, Category.Humidity));

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
        }
    });
    peripheral.on('error', (data: any)  => {
        log.error('ruuvi-tag.createPeripheral.on(error): ' + JSON.stringify(data));
    });
    tags[peripheral.id].log.startLogging();
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
