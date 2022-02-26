
import { DeviceState } from './device-state';
import { DeviceStatus } from './device-status';


import * as os from 'os';

import { log } from '../../core/logger';

type NetworkInterfaceInfo =  { [index: string]: os.NetworkInterfaceInfo[] };

export class DeviceChecks extends DeviceState {
    // Interface methods implementation

    constructor() {
        super();
    }
    public check(): void {
        const data: DeviceStatus = new DeviceStatus();
        data.timestamp = Date.now();
        data.hostname = os.hostname();
        data.loadavg = os.loadavg();
        data.uptime = os.uptime();
        data.freemem = os.freemem();
        data.totalmem = os.totalmem();
        data.release = os.release();
        data.networkInterfaces = this.stdExternalIPv4Of(os.networkInterfaces());
        data.userInfo = os.userInfo();
        data.memoryUsage = process.memoryUsage();
        data.cpuUsage = process.cpuUsage();
        data.pid = process.pid;
        log.debug('DeviceChecks.check data=' + JSON.stringify(data.memoryUsage));
        this.updateDeviceData(data);
    }
    private stdExternalIPv4Of(nets: NetworkInterfaceInfo): NetworkInterfaceInfo {
        const ifaceNamePattern = /\*[0-9]$/; // looking for interface names that ends with a digit, eg eth0, wlan0
        const ExternalIPv4s: NetworkInterfaceInfo = {};
        for (const ifaceName in nets) {
                for (const net of nets[ifaceName]) {
                    if (net.family === 'IPv4' && !net.internal) {
                        if (!ExternalIPv4s[ifaceName]) {
                            ExternalIPv4s[ifaceName] = []; 
                        } 
                        ExternalIPv4s[ifaceName].push(net);
                    }
                }
        }
        return ExternalIPv4s;
    }
}

