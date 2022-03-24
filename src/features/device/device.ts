import {DeviceChecks} from './device-checks';

import { DeviceLog } from './device-log';

import { log } from '../../core/logger';

export class Device {
    private static loggers: DeviceLog[] = [];
    private static checks: DeviceChecks[] = [];
    private static POLL_INTERVAL: number = 120000;

    // private POLL_INTERVAL: number = Settings.get('POLL_INTERVAL').value | 5000;

    private static deviceInitialized = false;

    private static timer: NodeJS.Timer;

    public static getLoggers(): DeviceLog[] {
        return Device.loggers;
    }

    public static init(): void {
        log.info ('Device.initialize: start time=' + new Date().toISOString());

        const deviceChecks = new DeviceChecks();
        Device.checks.push(deviceChecks);
        Device.createDeviceLog(deviceChecks);

        log.debug('Device.initialize POLLING INTERVAL=' + Device.POLL_INTERVAL);
        Device.deviceInitialized = true;
        Device.startPolling();
        log.info('Device.initialize done');
    }

    private static createDeviceLog(DeviceState: DeviceChecks) {
        const deviceLog = new DeviceLog(DeviceState);
        Device.loggers.push(deviceLog);
        deviceLog.startLogging();
    }
    public static startPolling() {
        clearInterval(Device.timer);
        Device.timer = setInterval(Device.poll, Device.POLL_INTERVAL);
        log.info('Device.startPolling: ' + Device.POLL_INTERVAL + ' ms');
    }
    private static poll() {
        if (! Device.deviceInitialized) {
            Device.init();
        } else {
            log.debug('Device.poll');
            for (const check of Device.checks) {
                check.check();
            }
        }
    }
}
