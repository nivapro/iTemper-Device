import axios, { AxiosError, AxiosInstance } from 'axios';
import * as https from 'https';
import { log } from '../../core/logger';

import { stringify } from '../../core/helpers';
import { Setting, Settings } from '../../core/settings';

import WebSocket from 'isomorphic-ws';

export enum Category {
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
export interface Sample {
    value: number;
    date: number;
}
export interface Descriptor {
    SN: string;
    port: number;
}
export interface Attributes {
    model: string;
    category: Category;
    accuracy: number;
    resolution: number;
    maxSampleRate: number;
}
export interface Log {
    desc: Descriptor;
    samples: Sample[];
}
export interface Registration {
    desc: Descriptor;
    attr: Attributes;
}
export interface SensorLogError {
    status: number;
    desc: Descriptor;
}
export interface ISensorLogService {
    registerSensor(registration: Registration): Promise<Descriptor>;
    PostSensorLog(data: Log): Promise<Descriptor>;
    writeSensorLog(sensorLog: Log): void;
}
export class SensorLogService implements  ISensorLogService {
    private axios: AxiosInstance;
    private SHARED_ACCESS_KEY: string = '';
    private WS_URL: string = '';
    private WS_ORIGIN: string = '';
    private ITEMPER_URL: string = '';
    private socket: WebSocket;
    private PostSensorLogError: boolean = false;
    private webSocketError = false;
    private reopen = false;
    private writeSensorLogError = false;

    private createAxiosInstance(): AxiosInstance {
        const rejectUnauthorized = !this.ITEMPER_URL.includes('localhost');
        return this.axios = axios.create({
            baseURL: this.ITEMPER_URL + '/sensors',
            headers: {'Content-Type': 'application/json'},
            httpsAgent: rejectUnauthorized ? undefined :  new https.Agent({rejectUnauthorized: false}),
        });
    }

    private openWebSocket(): WebSocket {
        const self = this;
        const url = this.WS_URL;
        const protocol = 'iot-gateway';
        const origin = this.WS_ORIGIN;
        const perMessageDeflate = false;
        const rejectUnauthorized = !this.ITEMPER_URL.includes('localhost');
        const options = { protocol, origin, perMessageDeflate, rejectUnauthorized };
        const socket = new WebSocket (url, options);
        log.info('SensorLog.openWebSocket, new WebSocket options=' + JSON.stringify(options, null, 2));

        socket.on('open', (s: WebSocket) => {
            if (self.webSocketError) {
                const protocolInfo = ', WebSocket=' + JSON.stringify(s);
                log.info('SensorLog.openWebSocket.on(open): url' + url + protocolInfo);
                self.webSocketError = false;
            }
        });
        socket.on('message', (data: WebSocket.Data): void => {
            log.debug('SensorLog.openWebSocket.on(message): ' + data);
        });
        socket.on('error', (self: WebSocket, error: Error) => {
            if (!this.webSocketError) {
                this.webSocketError = true;
                log.error('SensorLog.openWebSocket.on(error): ws=' + JSON.stringify(self));
                log.error('SensorLog.openWebSocket.on(error): error=' + JSON.stringify(error));
            }
        });

        socket.on('close', (self: WebSocket, code: number, reason: string) => {
            if (code === 404) {
                log.error('SensorLog.openWebSocket.on(close): code: 404');
            }
            log.debug('SensorLog.openWebSocket.on(close): ws=' + JSON.stringify(self));
            log.debug('SensorLog.openWebSocket.on(close): code/reason=' + code +'/'+ reason);
        });
        return socket;
    }
    constructor() {
        this.initSettings();
        this.axios = this.createAxiosInstance();
        this.socket = this.openWebSocket();
    }

    private initSettings() {
        this.SHARED_ACCESS_KEY = Settings.get(Settings.SHARED_ACCESS_KEY).value.toString();
        this.WS_URL = Settings.get(Settings.WS_URL).value.toString();
        this.WS_ORIGIN = Settings.get(Settings.WS_ORIGIN).value.toString();
        this.ITEMPER_URL = Settings.get(Settings.ITEMPER_URL).value.toString();

        Settings.onChange('SHARED_ACCESS_KEY', (setting: Setting) => {
            this.SHARED_ACCESS_KEY = setting.value.toString();
            log.info('SensorLog.settingChanged: SHARED_ACCESS_KEY=' + this.SHARED_ACCESS_KEY);
        });
        Settings.onChange('WS_URL', (setting: Setting)=> {
            this.WS_URL = setting.value.toString();
            log.info('SensorLog.settingChanged: WS_URL=' + this.WS_URL);
            this.socket = this.openWebSocket();
        });
        Settings.onChange('WS_ORIGIN', (setting: Setting)=> {
            this.WS_ORIGIN = setting.value.toString();
            log.info('SensorLog.settingChanged: WS_ORIGIN=' + this.WS_ORIGIN);
            // if (this.socket.OPEN) {
            //     this.socket.close();
            // }
            this.socket = this.openWebSocket();
        });
        Settings.onChange('ITEMPER_URL', (setting: Setting)=> {
            this.ITEMPER_URL = setting.value.toString();
            log.info('SensorLog.settingChanged: ITEMPER_URL=' +  this.ITEMPER_URL);
            this.axios = this.createAxiosInstance();
        });
    }
    public registerSensor(registration: Registration): Promise<Descriptor> {
        const self = this;
        return new Promise((resolve, reject) => {
            const body = registration;
            const url = '';
            const Authorization = 'Bearer ' + this.SHARED_ACCESS_KEY;
            this.axios.post(url, body, {headers: { Authorization }})
            .then (function() {
                resolve(registration.desc);
            })
            .catch(function(error: AxiosError) {
                try {
                    const err = { status: self.handleError(error), desc: registration.desc };
                    reject(err);
                } catch {
                    const err = { status: self.handleError(error), desc: registration.desc };
                    reject(err);
                }
            });
        });
    }
    public PostSensorLog(data: Log): Promise<Descriptor> {
        const self = this;
        return new Promise((resolve, reject) => {
            const url = '/' + data.desc.SN + '/'+ data.desc.port;
            const Authorization = 'Bearer ' + this.SHARED_ACCESS_KEY;
            this.axios.post<Log>(url, data, {headers: { Authorization }})
            .then (function() {
                if (self.PostSensorLogError) {
                    self.PostSensorLogError = false;
                    log.info('sensor-log-service.PostSensorLog data=%s', data);
                }
                resolve(data.desc);
            })
            .catch(function(error: AxiosError) {
                try {
                    const err = { status: self.handleError(error), desc: data.desc };
                    reject(err);
                } catch {
                    const err = { status: self.handleError(error), desc: data.desc };
                    reject(err);
                }
            });
        });
    }
    public writeSensorLog(data: Log): void {
        const self = this;
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            const message = {command: 'log', data};
            this.socket.send(JSON.stringify(message), (err) => {
                if (err) {
                    if (!self.writeSensorLogError) {
                        self.writeSensorLogError = true;
                        log.error('sensor-log-service.writeSensorLog err=%s', err);
                    }
                } else {
                    if(self.writeSensorLogError) {
                        self.writeSensorLogError = false;
                        log.info('sensor-log-service.writeSensorLog data=%s', data);
                    }
                }
            });
        } else if (!this.socket || this.socket.readyState === WebSocket.CLOSED) {
            if (!this.reopen) {
                this.reopen = true;
                const self = this;
                setTimeout(() => {
                    self.socket = this.openWebSocket();
                    self.reopen = false;
                }, 5_000);
            }
        } else {
            log.debug('sensor-log-service.writeSensorLog: : socket not open yet');
        }
    }
    private handleError(error: AxiosError): number {
        let status = 1;
        if (error.response) {
            if (!this.PostSensorLogError) {
                const statusText = error.response.status === 422
                    ? JSON.stringify(error.response.data, undefined, 2)
                    :  error.response.statusText;
                log.error('sensor-log-service.handleError: status=' +
                    error.response.status + ': ' + statusText);
            }
            status = error.response.status;
            if (error.response.status === 308) {
                const {  name } = error.response.data;
                if (name) {
                    Settings.update(Settings.SERIAL_NUMBER, name, ( updated ) => {
                        if (!updated) {
                            log.error('sensor-log-service.handleError: cannot update serial number after redirect request from itemper ');
                        }
                    });
                }
            }
        } else if (error.request) {
            // The request was made but no response was received
            if (!this.PostSensorLogError) {
                log.error('sensor-log-service.handleError, no response');
            }
        } else {
            // Something happened in setting up the request that triggered an Error
            if (!this.PostSensorLogError) {
                log.error('sensor-log-service.handleError,  error.config:' + stringify(error.config));
            }
        }
        this.PostSensorLogError = true;
        return status;
    }
}
export let sensorLogService: SensorLogService;

export function init() {
    sensorLogService = new SensorLogService();
}

