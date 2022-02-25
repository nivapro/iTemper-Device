import * as ble from './../features/ble';

import http from 'http';
import { exit } from 'process';
import { log } from './logger';

export function init(server: http.Server) {
    const signals: NodeJS.Signals[] = ['SIGTERM', 'SIGINT'];

    signals.forEach((signal) => {
        process.on(signal , () => {
            log.debug(signal + ' received: closing application');
            closeApp();
        });
    });

    function closeApp() {
        ble.close();
        server.close(() => {
            log.info('HTTP server closed');
        });
        log.info('Closing itemper application, bye.');
        exit(0);
    }
}
