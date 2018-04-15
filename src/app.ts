﻿import * as cors from 'cors';
import express = require('express');
import * as http from 'http';
import path = require('path');

import route_api from './routes/api';
import route_debug from './routes/debug';
import route_index from './routes/index';

import { USBSensorManager } from './models/usb-sensor-manager';

import { log } from './logger';

const app: express.Express = express();
// TODO: CORS hardening
app.use(cors());
app.options('*', cors());
app.disable('etag');

USBSensorManager.factory();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', route_index);
app.use('/api', route_api);
app.use('/debug', route_debug);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    const err: Error = new Error('Not Found at server');
    err['status'] = 404;
    next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use((err: any, req: any, res: any, next: any) => {
        res.status(err['status'] || 500);
        res.render('error', {
            message: err.message,
            error: err});
    });
}

// production error handler
// no stacktraces leaked to user
app.use((err: any, req: any, res: any, next: any) => {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}});
});

app.set('port', process.env.PORT || 80);

const server: http.Server = app.listen(app.get('port'), function() {
    log.info('iTemper listening on port ' + server.address().port);
});
