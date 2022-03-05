/*
 * GET sensor data.
 */
import * as express from 'express';
const router: express.Router = express.Router();
import cors from 'cors';

import { SensorLog } from '../features/sensors/sensor-log';

import { log } from '../core/logger';

router.get('/', cors(), (_req: express.Request, res: express.Response) => {

    const sensorLogger =
    SensorLog.getLoggers().find(logger=> logger.getState !== undefined);

    res.setHeader('Content-Type', 'application/json');
    if (sensorLogger) {
        const sensorData = sensorLogger.getState().getSensorData();
        log.debug('api.router.get: state: ', sensorLogger.getState());

        log.debug('api.router.get: data=', sensorData);
        res.status(200).send(JSON.stringify(sensorData));

    } else {
        res.status(200).send('no sensor log available');
        log.debug('api.router.get: no sensor log');
    }

});


export default router;

