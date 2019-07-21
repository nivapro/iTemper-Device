"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
var logger_1 = require("./../logger");
var usb_sensor_manager_1 = require("../models/usb-sensor-manager");
router.post('/', function (_req, res) {
    res.setHeader('Content-Type', 'application/json');
    res.status(404);
    var response = [];
    if (_req.query.level) {
        var level = _req.query.level;
        logger_1.log.debug('/settings _req.query.level:', level);
        if (level && (level === 'debug' || level === 'info' || level === 'warn' || level === 'error')) {
            logger_1.log.info('/settings log level:', level);
            logger_1.setLevel(level);
            response.push({ level: level });
            res.status(200);
        }
        else {
            logger_1.log.warn('/settings level not set:', level);
        }
    }
    if (_req.query.interval) {
        try {
            var interval = _req.query.interval;
            logger_1.log.debug('/settings _req.query.interval:', interval);
            if (1 <= interval && interval <= 60 * 60) {
                var ms = 1000 * interval;
                logger_1.log.debug('/settings interval ms:', ms);
                usb_sensor_manager_1.USBSensorManager.setPollingInterval(ms);
                response.push({ interval: interval });
                res.status(200);
                logger_1.log.info('/settings interval set:', interval);
            }
            else {
                logger_1.log.warn('/settings interval out of range:', _req.query.interval);
            }
        }
        catch (e) {
            logger_1.log.debug('/settings interval not set:', _req.query.interval);
        }
    }
    res.send(response);
});
exports.default = router;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXMvc2V0dGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxpQ0FBb0M7QUFDcEMsSUFBTSxNQUFNLEdBQW1CLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUNoRCxzQ0FBNEM7QUFFNUMsbUVBQWdFO0FBR2hFLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLFVBQUMsSUFBcUIsRUFBRSxHQUFxQjtJQUMxRCxHQUFHLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0lBQ2xELEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDaEIsSUFBTSxRQUFRLEdBQVUsRUFBRSxDQUFDO0lBRTNCLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUU7UUFDbEIsSUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUM7UUFDL0IsWUFBRyxDQUFDLEtBQUssQ0FBQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNoRCxJQUFJLEtBQUssSUFBSSxDQUFDLEtBQUssS0FBSyxPQUFPLElBQUksS0FBSyxLQUFLLE1BQU0sSUFBSSxLQUFLLEtBQUssTUFBTSxJQUFJLEtBQUssS0FBSyxPQUFPLENBQUMsRUFBRTtZQUMzRixZQUFHLENBQUMsSUFBSSxDQUFDLHNCQUFzQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ3hDLGlCQUFRLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDaEIsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssT0FBQSxFQUFDLENBQUMsQ0FBQztZQUN2QixHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1NBQ25CO2FBQU07WUFDSCxZQUFHLENBQUMsSUFBSSxDQUFDLDBCQUEwQixFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQy9DO0tBQ0o7SUFFRCxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxFQUFFO1FBQ3JCLElBQUk7WUFDQSxJQUFNLFFBQVEsR0FBVyxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQztZQUM3QyxZQUFHLENBQUMsS0FBSyxDQUFDLGdDQUFnQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQ3RELElBQUksQ0FBQyxJQUFJLFFBQVEsSUFBSSxRQUFRLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRTtnQkFDdEMsSUFBTSxFQUFFLEdBQVcsSUFBSSxHQUFHLFFBQVEsQ0FBQztnQkFDbkMsWUFBRyxDQUFDLEtBQUssQ0FBQyx3QkFBd0IsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDeEMscUNBQWdCLENBQUMsa0JBQWtCLENBQUMsRUFBRSxDQUFDLENBQUM7Z0JBQ3hDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBQyxRQUFRLFVBQUEsRUFBQyxDQUFDLENBQUM7Z0JBQzFCLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ2hCLFlBQUcsQ0FBQyxJQUFJLENBQUMseUJBQXlCLEVBQUUsUUFBUSxDQUFDLENBQUM7YUFDakQ7aUJBQU07Z0JBQ0gsWUFBRyxDQUFDLElBQUksQ0FBQyxrQ0FBa0MsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQ3JFO1NBQ0o7UUFBQyxPQUFNLENBQUMsRUFBRTtZQUNQLFlBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNqRTtLQUNKO0lBRUQsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUN2QixDQUFDLENBQUMsQ0FBQztBQUVILGtCQUFlLE1BQU0sQ0FBQyIsImZpbGUiOiJyb3V0ZXMvc2V0dGluZ3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxyXG4gKiBHRVQgc2Vuc29yIGRhdGEuXHJcbiAqL1xyXG5pbXBvcnQgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKTtcclxuY29uc3Qgcm91dGVyOiBleHByZXNzLlJvdXRlciA9IGV4cHJlc3MuUm91dGVyKCk7XHJcbmltcG9ydCB7IGxvZywgc2V0TGV2ZWwgfSBmcm9tICcuLy4uL2xvZ2dlcic7XHJcblxyXG5pbXBvcnQgeyBVU0JTZW5zb3JNYW5hZ2VyIH0gZnJvbSAnLi4vbW9kZWxzL3VzYi1zZW5zb3ItbWFuYWdlcic7XHJcblxyXG5cclxucm91dGVyLnBvc3QoJy8nLCAoX3JlcTogZXhwcmVzcy5SZXF1ZXN0LCByZXM6IGV4cHJlc3MuUmVzcG9uc2UpID0+IHtcclxuICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICByZXMuc3RhdHVzKDQwNCk7XHJcbiAgICBjb25zdCByZXNwb25zZTogYW55W10gPSBbXTtcclxuXHJcbiAgICBpZiAoX3JlcS5xdWVyeS5sZXZlbCkge1xyXG4gICAgICAgIGNvbnN0IGxldmVsID0gX3JlcS5xdWVyeS5sZXZlbDtcclxuICAgICAgICBsb2cuZGVidWcoJy9zZXR0aW5ncyBfcmVxLnF1ZXJ5LmxldmVsOicsIGxldmVsKTtcclxuICAgICAgICBpZiAobGV2ZWwgJiYgKGxldmVsID09PSAnZGVidWcnIHx8IGxldmVsID09PSAnaW5mbycgfHwgbGV2ZWwgPT09ICd3YXJuJyB8fCBsZXZlbCA9PT0gJ2Vycm9yJykpIHtcclxuICAgICAgICAgICAgbG9nLmluZm8oJy9zZXR0aW5ncyBsb2cgbGV2ZWw6JywgbGV2ZWwpO1xyXG4gICAgICAgICAgICBzZXRMZXZlbChsZXZlbCk7XHJcbiAgICAgICAgICAgIHJlc3BvbnNlLnB1c2goe2xldmVsfSk7XHJcbiAgICAgICAgICAgIHJlcy5zdGF0dXMoMjAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBsb2cud2FybignL3NldHRpbmdzIGxldmVsIG5vdCBzZXQ6JywgbGV2ZWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoX3JlcS5xdWVyeS5pbnRlcnZhbCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGludGVydmFsOiBudW1iZXIgPSBfcmVxLnF1ZXJ5LmludGVydmFsO1xyXG4gICAgICAgICAgICBsb2cuZGVidWcoJy9zZXR0aW5ncyBfcmVxLnF1ZXJ5LmludGVydmFsOicsIGludGVydmFsKTtcclxuICAgICAgICAgICAgaWYgKDEgPD0gaW50ZXJ2YWwgJiYgaW50ZXJ2YWwgPD0gNjAgKiA2MCkge1xyXG4gICAgICAgICAgICAgICAgY29uc3QgbXM6IG51bWJlciA9IDEwMDAgKiBpbnRlcnZhbDtcclxuICAgICAgICAgICAgICAgIGxvZy5kZWJ1ZygnL3NldHRpbmdzIGludGVydmFsIG1zOicsIG1zKTtcclxuICAgICAgICAgICAgICAgIFVTQlNlbnNvck1hbmFnZXIuc2V0UG9sbGluZ0ludGVydmFsKG1zKTtcclxuICAgICAgICAgICAgICAgIHJlc3BvbnNlLnB1c2goe2ludGVydmFsfSk7XHJcbiAgICAgICAgICAgICAgICByZXMuc3RhdHVzKDIwMCk7XHJcbiAgICAgICAgICAgICAgICBsb2cuaW5mbygnL3NldHRpbmdzIGludGVydmFsIHNldDonLCBpbnRlcnZhbCk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICBsb2cud2FybignL3NldHRpbmdzIGludGVydmFsIG91dCBvZiByYW5nZTonLCBfcmVxLnF1ZXJ5LmludGVydmFsKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2goZSkge1xyXG4gICAgICAgICAgICBsb2cuZGVidWcoJy9zZXR0aW5ncyBpbnRlcnZhbCBub3Qgc2V0OicsIF9yZXEucXVlcnkuaW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICByZXMuc2VuZChyZXNwb25zZSk7XHJcbn0pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcm91dGVyO1xyXG5cclxuIl19