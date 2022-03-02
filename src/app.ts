import { conf } from './core/config';
import { Settings } from './core/settings';

import { log } from './core/logger';

import express from 'express';

import http from 'http';
import path from 'path';
import * as WebSocket from 'ws';

import route_sensors from './routes/sensors';
import route_settings from './routes/settings';

import * as clientService from './features/client-service/client-service';

import * as ble from './features/ble';

import { Device } from './features/device/device';
import { USBController } from './features/sensors/usb-controller';

import * as ruuvi from './features/ruuvi/ruuvi-tag';

import { getUuid, UUID_Designator } from './features/ble/gatt-server/uuid';

import * as logService from './features/sensors/sensor-log-service';

import * as wifi from './features/wifi';

import * as shutdown from './core/shutdown';
// Init itemper modules
Settings.init();
logService.init();
Device.init();
USBController.init();
wifi.init();
if (conf.BLUETOOTH !== '') {
        log.info('Enabling Bluetooth GATT server,  Primary Service: ' + getUuid(UUID_Designator.PrimaryService));
        ble.init();
        if (conf.RUUVI_TAGS !== '') {
            log.info('Enabling Ruuvi tags Bluetooth sensors');
            ruuvi.init();
        } else {
            log.info('Set env RUUVI_TAGS=true to enable support for Ruuvi tags Bluetooth sensors'); 
        }
} else {
    log.info('Bluetooth not enabled');
}

// Init itemper device server
const app = express();

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// REST API - for debugging
app.use('/sensors', route_sensors);
app.use('/settings', route_settings);

const httpServer = http.createServer(app);

// Clients connect with web sockets

const wss = new WebSocket.Server({ server: httpServer });
clientService.init(wss);

// open service
const port = process.env.PORT || 80;
const server = httpServer.listen(port, () => {
    log.info('iTemper device listening on port ' + port);
});

shutdown.init(server);

export default server;
