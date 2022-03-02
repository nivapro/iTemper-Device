import * as https  from 'https';
import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';
import { log } from '../../core/logger';
import { DeviceState } from './device-state';
import { DeviceStatus } from './device-status';

import { stringify } from './../../core/helpers';


import {Setting, Settings} from '../../core/settings';

export interface DeviceDataLog {
    data: DeviceStatus;
}

export class DeviceLog {
    public retryCounter = 0;
    private state: DeviceState;
    private logging: boolean = false;

    private axios: AxiosInstance;
    private SHARED_ACCESS_KEY: string = '';
    private ITEMPER_URL: string = '';
    private onDataReceivedError = false;

    private createAxiosInstance(): AxiosInstance {
        const rejectUnauthorized = !this.ITEMPER_URL.includes('localhost');
        return this.axios = axios.create({
            baseURL: this.ITEMPER_URL + '/device',
            headers: {'Content-Type': 'application/json'},
            httpsAgent: rejectUnauthorized ? undefined :  new https.Agent({rejectUnauthorized: false}),
        });
    }

    constructor(state: DeviceState) {
        this.onDataReceivedError = false;
        this.logging = false;
        this.state = state;
        this.initSettings();
        this.state.addDeviceDataListener(this.onDataReceived.bind(this));
        this.axios = this.createAxiosInstance();
    }

    private initSettings() {
        this.SHARED_ACCESS_KEY = Settings.get(Settings.SHARED_ACCESS_KEY).value.toString();

        this.ITEMPER_URL = Settings.get(Settings.ITEMPER_URL).value.toString();
        // this.AZURE_CONNECTION_STRING = Settings.get(Settings.AZURE_CONNECTION_STRING).value.toString();

        Settings.onChange('SHARED_ACCESS_KEY', (setting: Setting) => {
            this.SHARED_ACCESS_KEY = setting.value.toString();
            log.info('DeviceLog.settingChanged: SHARED_ACCESS_KEY=' + this.SHARED_ACCESS_KEY);
        });

        Settings.onChange('ITEMPER_URL', (setting: Setting)=> {
            this.ITEMPER_URL = setting.value.toString();
            log.info('DeviceLog.settingChanged: ITEMPER_URL=' +  this.ITEMPER_URL);
            this.axios = this.createAxiosInstance();
        });
    }
    public getState(): DeviceState {
        return this.state;
    }
    public islogging(): boolean {
        return this.logging;
    }
    public startLogging(): void {
        log.info('DeviceLog.startLogging');
        this.logging = true;
    }

    public stopLogging(): void {
        log.info('DeviceLog.stopLogging');
        this.logging = false;
    }

    private onDataReceived(data: DeviceStatus): void {
        const m = 'DeviceLog.onDataReceived: ';
        if (this.logging) {
            const self = this;
            const deviceLog: DeviceDataLog = {data};
            const url = '/status';
            log.debug(m + 'URL: ' + url);
            const Authorization = 'Bearer ' + this.SHARED_ACCESS_KEY;
            this.axios.post<DeviceDataLog>(url, deviceLog, {headers: { Authorization }})
            .then (function(res) {
                log.debug(m + 'post ' + res.config.url + ' ' + res.statusText);
                self.onDataReceivedError = false;
            })
            .catch(function(error: AxiosError) {
                if (error.response) {
                    // The request was made and the server responded with a status code
                    // that falls out of the range of 2xx
                    if (!self.onDataReceivedError) {
                        self.onDataReceivedError = true;
                        const statusText = error.response.status === 422 
                        ? JSON.stringify(error.response.data, undefined, 2)
                        :  error.response.statusText;
                        log.error(m + ': status=' + error.response.status + ': ' +
                                    statusText + ', url: ' + url);
                    }
                    log.debug(m + 'response data: ' + JSON.stringify(error.response.data) + ', url: ' + url);
                } else if (error.request) {
                    // The request was made but no response was received
                    if (!self.onDataReceivedError) {
                        self.onDataReceivedError = true;
                        log.error(m + 'no response:' +  JSON.stringify(error.config.baseURL));
                    }
                    log.debug(m + 'error.request=' + stringify(error.request));
                } else {
                    // Something happened in setting up the request that triggered an Error
                    if (!self.onDataReceivedError) {
                        self.onDataReceivedError = true;
                        log.error(m + 'error.config:' + JSON.stringify(error.config));
                    }
                }
            });
        }
    }
}
