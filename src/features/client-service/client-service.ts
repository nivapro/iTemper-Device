import http from 'http';
import * as WebSocket from 'ws';

import { log } from '../../core/logger';
import { Setting, Settings } from '../../core/settings';
import { SensorAttributes } from '../sensors/sensor-attributes';
import { SensorData } from '../sensors/sensor-data';
import { SensorLog } from '../sensors/sensor-log';
import { SensorState } from '../sensors/sensor-state';

import { USBController } from '../sensors/usb-controller';

export interface InboundMessage {
    command: 'getSensors'|'getSettings'| 'startMonitor' | 'stopMonitor' | 'saveSetting';
    data: any;
}

export interface OutboundMessage {
    command: 'sensors' | 'settings'| 'setting' |  'log';
    data: any;
}
let wss: WebSocket.Server;
let webSocketError = false;
export function init(server: WebSocket.Server) {
    wss=server;
    wss.on('connection', (ws: WebSocket, request: http.IncomingMessage): void  => {
        log.info('client-service.wss.on (connection):  url/headers: ' + ws.url + '/' + JSON.stringify(request.headers));
        ws.on('close', (ws: WebSocket, code: number, reason: string): void => {
          log.debug('client-service.wss.on (close): '+ ws.url + ' + code: ' + code +  'reason: ' + reason);
        });
        ws.on('message', (data: Buffer): void => {
            log.debug('client-service.wss.on (message): message: ' + data.toString());
            parseInboundMessage(ws, data);
            webSocketError = false;
        });
        ws.on('error', (): void => {
            if (!webSocketError) {
                webSocketError = true;
                log.error('client-service.wss.on (error)');
            }
          });
    } );
}
function broadcast(ws: WebSocket, message: OutboundMessage, includeSelf: boolean ) {
    wss.clients.forEach(function each(client) {
        if ((client !== ws || includeSelf) && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
          log.debug('client-service.broadcast: message sent');
        }
      });

}
function broadcastAll(message: OutboundMessage) {
    wss.clients.forEach(function each(client) {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(message));
          log.debug('client-service.broadcastAll: message sent');
        }
    });

}
function parseInboundMessage(ws: WebSocket, data: Buffer): void  {
    const message = <InboundMessage> JSON.parse(data.toString());
    switch (message.command) {
        case 'getSensors':
            log.debug('client-service.parseInboundMessage.getSensors');
            getSensors(ws);
            break;
        case 'getSettings':
            log.debug('client-service.parseInboundMessage.getSettings');
            getSettings(ws);
            break;
        case 'startMonitor':
            log.debug('client-service.parseInboundMessage.startMonitor');
            message.data = <SensorDescription[]> <any> message.data;
            startMonitor(ws, message.data);
            break;
        case 'stopMonitor':
            log.debug('client-service.parseInboundMessage.stopMonitor');
            message.data = <SensorDescription[]> <any> message.data;
            stopMonitor(ws, message.data);
            break;
        case 'saveSetting':
            log.debug('client-service.parseInboundMessage.saveSetting');
            message.data = <Setting> <any> message.data;
            saveSetting(ws, message.data);
            break;
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
export interface SensorLogData {
    desc: SensorDescription;
    attr: SensorAttributes;
    samples: SensorSample[];
}
function description(attr: SensorAttributes, data: SensorData): SensorDescription {
    return {SN: attr.SN, port: data.getPort()};
}
function sensorSample(data: SensorData): SensorSample {
    return {value: data.getValue(), date: data.timestamp()};
}
function AddSensorLogs(sensorLogs: SensorLogData[], state: SensorState): void {

    const sensorData: SensorData[] = state.getSensorData(); // one sensorData for each sensor

    for (const sensor of sensorData) {
        const samples: SensorSample[] = [];
        const attr: SensorAttributes = state.getAttr(sensor.getPort());
        samples.push(sensorSample(sensor));
        sensorLogs.push({ desc: description(attr, sensor), attr, samples});
    }
}
export function getSensors(ws: WebSocket) {
    const loggers = SensorLog.getLoggers();
    const command = 'sensors';
    const data: SensorLogData[] = [];
    for (const logger of loggers) {
        const state = logger.getState();
        AddSensorLogs(data, state);
    }
    const message = JSON.stringify({command, data});
    ws.send(message);
    log.debug('client-services.getSensors, sent: ' + message);
}

export function getSettings(ws: WebSocket) {
    const data: Setting[] = Settings.all();
    const message = JSON.stringify({command:'settings', data});
    ws.send(message);
    log.info('client-service.getSettings: sends settings to client' + message);
    for (const setting of data) {
        Settings.onChange(setting.name, publishSetting);
    }
    log.info('client-service.getSettings: subscribed to future setting changes');
}
export function publishSetting(setting: Setting) {
    const data: Setting[] = [setting];
    const message: OutboundMessage = {command:'settings', data};
    broadcastAll(message);

}
export function saveSetting(ws: WebSocket, setting: Setting) {
    log.debug('client-service.saveSetting: ' + JSON.stringify(setting));
    if (setting.name && setting.value) {
        Settings.update(setting.name, setting.value, (updated) => {
            if (updated) {
                const command = 'settings';
                const data = [];
                data.push(setting);
                const message: OutboundMessage = {command, data};
                broadcast(ws, message, true);
            }
        });
    }

}
const MonitoringClients = new Set();
let logTimer: NodeJS.Timer;

export function startMonitor(ws: WebSocket, desc: SensorDescription[]) {
    if (!MonitoringClients.has(ws)) {
        MonitoringClients.add(ws);
    }

    if (MonitoringClients.size === 1) {
        const interval = USBController.getPollingInterval();
        logTimer = setInterval(logSensorData, interval === 0 ? 60_000 : interval);
    }
    log.info ('client-service.startMonitor: ' + desc.length);
}

export function stopMonitor(ws: WebSocket, desc: SensorDescription[]) {

    if (MonitoringClients.has(ws)) {
        MonitoringClients.delete(ws);
    }
    if (MonitoringClients.size === 0) {
        clearTimeout(logTimer);
    }
    log.info ('client-service.stopMonitor: ' + desc.length);
}

function logSensorData() {
    const loggers = SensorLog.getLoggers();
    const command = 'log';
    const data: SensorLogData[] = [];
    for (const logger of loggers) {
        const state = logger.getState();
        AddSensorLogs(data, state);
    }
    if (data.length > 0) {
        const message = JSON.stringify({command, data});

        MonitoringClients.forEach((ws: WebSocket) => {
            if (ws.readyState === ws.OPEN) {
                ws.send(message);
            }

            if (ws.readyState === ws.CLOSED || ws.readyState === ws.CLOSING ) {
                MonitoringClients.delete(ws);
            }
        });
        log.debug ('client-service.logSensorData: sent to ' + MonitoringClients.size + ' clients, message: ' + message);
    }

}
