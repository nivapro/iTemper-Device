"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var logger_1 = require("../logger");
var settings_1 = require("./settings");
var USBDevice = (function () {
    function USBDevice(hid, reporter) {
        this.POLL_INTERVAL = 5000;
        this.MAX_SAMPLE_RATE = 1 / this.POLL_INTERVAL;
        this.deviceInitialized = false;
        this.hid = hid;
        this.reporter = reporter;
        this.MAX_SAMPLE_RATE = reporter.maxSampleRate();
        if (this.sampleRate() > this.MAX_SAMPLE_RATE) {
            this.POLL_INTERVAL = 1000 * 1 / this.MAX_SAMPLE_RATE;
        }
        settings_1.Settings.onChange(settings_1.Settings.POLL_INTERVAL, this.pollIntervalChanged.bind(this));
        this.initializeDevice();
        this.pollSensors();
    }
    USBDevice.prototype.pollIntervalChanged = function (setting) {
        var pollInterval = setting.value;
        var sampleRate = 1 / (pollInterval / 1000);
        if (sampleRate < this.MAX_SAMPLE_RATE) {
            this.POLL_INTERVAL = pollInterval;
            logger_1.log.info('USBDevice.pollIntervalChanged to' + pollInterval);
        }
    };
    USBDevice.prototype.initializeDevice = function () {
        if (!this.deviceInitialized) {
            this.hid.on('data', this.parseInput.bind(this));
            this.hid.on('error', this.parseError.bind(this));
            this.setPollingInterval(this.POLL_INTERVAL);
            logger_1.log.debug('USBDevice.initializeDevice POLLING INTERVAL=' + this.POLL_INTERVAL);
            this.deviceInitialized = true;
            logger_1.log.info('USBDevice.initializeDevice done');
        }
    };
    USBDevice.prototype.close = function () {
        this.deviceInitialized = false;
        try {
            this.hid.pause();
            this.hid.close();
        }
        catch (e) {
            return;
        }
    };
    USBDevice.prototype.sampleRate = function () {
        return 1 / (this.POLL_INTERVAL / 1000);
    };
    USBDevice.prototype.setPollingInterval = function (ms) {
        this.POLL_INTERVAL = ms;
        if (this.sampleRate() > this.MAX_SAMPLE_RATE) {
            this.POLL_INTERVAL = 1000 * 1 / this.MAX_SAMPLE_RATE;
        }
        clearInterval(this.timer);
        this.timer = setInterval(this.pollSensors.bind(this), this.POLL_INTERVAL);
        logger_1.log.info('USBDevice.setPollingInterval:' + ms);
    };
    USBDevice.prototype.getPollingInterval = function () {
        return this.POLL_INTERVAL;
    };
    USBDevice.prototype.pollSensors = function () {
        if (!this.deviceInitialized) {
            this.initializeDevice();
        }
        else {
            logger_1.log.debug('+++ USBController.pollSensors');
            var initCommands = this.reporter.initWriteReport();
            for (var _i = 0, initCommands_1 = initCommands; _i < initCommands_1.length; _i++) {
                var command = initCommands_1[_i];
                this.writeReport(command);
            }
        }
    };
    USBDevice.prototype.parseInput = function (data) {
        try {
            var response = this.reporter.readReport(data);
            if (response.length > 0) {
                this.writeReport(response);
            }
        }
        catch (e) {
            return;
        }
    };
    USBDevice.prototype.parseError = function (_error) {
        logger_1.log.error('parseError: ', _error);
    };
    USBDevice.prototype.writeReport = function (data) {
        if (os.platform() === 'win32') {
            data.unshift(0);
        }
        for (var i = 0; i < 1; i++) {
            try {
                this.hid.write(data);
                logger_1.log.debug('+++ USBController.writeReport', data);
            }
            catch (e) {
                logger_1.log.error('*** USBController.writeReport hid.write catch:&d', data);
                this.close();
            }
        }
    };
    return USBDevice;
}());
exports.USBDevice = USBDevice;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tb2RlbHMvdXNiLWRldmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLHVCQUEwQjtBQUMxQixvQ0FBZ0M7QUFDaEMsdUNBQWdEO0FBZWhEO0lBY0ksbUJBQVksR0FBWSxFQUFFLFFBQXFCO1FBUnZDLGtCQUFhLEdBQVcsSUFBSyxDQUFDO1FBRzlCLG9CQUFlLEdBQUcsQ0FBQyxHQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDdkMsc0JBQWlCLEdBQUcsS0FBSyxDQUFDO1FBSzlCLElBQUksQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDO1FBQ2YsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7UUFDekIsSUFBSSxDQUFDLGVBQWUsR0FBRyxRQUFRLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDaEQsSUFBSSxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRTtZQUMxQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUssR0FBRyxDQUFDLEdBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQztTQUN2RDtRQUNELG1CQUFRLENBQUMsUUFBUSxDQUFDLG1CQUFRLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztRQUMvRSxJQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztRQUN4QixJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDdkIsQ0FBQztJQUVPLHVDQUFtQixHQUEzQixVQUE0QixPQUFnQjtRQUN4QyxJQUFNLFlBQVksR0FBVSxPQUFPLENBQUMsS0FBSyxDQUFDO1FBQzFDLElBQU0sVUFBVSxHQUFHLENBQUMsR0FBQyxDQUFDLFlBQVksR0FBQyxJQUFLLENBQUMsQ0FBQztRQUUxQyxJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxFQUFFO1lBQ25DLElBQUksQ0FBQyxhQUFhLEdBQUcsWUFBWSxDQUFDO1lBQ2xDLFlBQUcsQ0FB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QUFPLENBQUMsRUFBRTtZQUVSLE9BQU87U0FDVjtJQUNMLENBQUM7SUFDTyw4QkFBVSxHQUFsQixVQUFtQixNQUFXO1FBQzFCLFlBQUcsQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ3RDLENBQUM7SUFHTywrQkFBVyxHQUFuQixVQUFvQixJQUFjO1FBRTlCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxLQUFLLE9BQU8sRUFBRTtZQUMzQixJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ25CO1FBR0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtZQUN4QixJQUFJO2dCQUNBLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNyQixZQUFHLENBQUMsS0FBSyxDQUFDLCtCQUErQixFQUFFLElBQUksQ0FBQyxDQUFDO2FBQ3BEO1lBQUMsT0FBTyxDQUFDLEVBQUU7Z0JBQ1IsWUFBRyxDQUFDLEtBQUssQ0FBQyxrREFBa0QsRUFBRSxJQUFJLENBQUMsQ0FBQztnQkFDcEUsSUFBSSxDQUFDLEtBQUssRUFBRSxDQUFDO2FBQ2hCO1NBRUo7SUFDTCxDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQTFIQSxBQTBIQyxJQUFBO0FBMUhZLDhCQUFTIiwiZmlsZSI6Im1vZGVscy91c2ItZGV2aWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXHJcbmltcG9ydCBISUQgPSByZXF1aXJlKCdub2RlLWhpZCcpO1xyXG5pbXBvcnQgb3MgPSByZXF1aXJlKCdvcycpO1xyXG5pbXBvcnQgeyBsb2cgfSBmcm9tICcuLi9sb2dnZXInO1xyXG5pbXBvcnQgeyBTZXR0aW5nLCBTZXR0aW5ncyAgfSBmcm9tICcuL3NldHRpbmdzJztcclxuXHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFVTQkNvbmZpZyBleHRlbmRzIEhJRC5EZXZpY2Uge1xyXG5cclxufVxyXG5cclxuLy8gUmVwb3J0UGFyc2VyIGFsbG93IFVTQkNvbnRyb2xsZXIgdG8gYmUgaW5kZXBlbmRlbnQgb24gdGhlIHNwZWNpZmljXHJcbi8vIFRlbXBlciBkZXZpY2UgY29ubmVjdGVkLlxyXG5leHBvcnQgaW50ZXJmYWNlIFVTQlJlcG9ydGVyIHtcclxuICAgIGluaXRXcml0ZVJlcG9ydCgpOiBudW1iZXJbXVtdO1xyXG4gICAgcmVhZFJlcG9ydChkYXRhOiBudW1iZXJbXSk6IG51bWJlcltdO1xyXG4gICAgbWF4U2FtcGxlUmF0ZSgpOiBudW1iZXI7XHJcbn1cclxuLy8gSGFuZGxlIGEgc2Vuc29yIGRldmljZSBvbiB0aGUgVVNCIGh1Yi5cclxuZXhwb3J0IGNsYXNzIFVTQkRldmljZSB7XHJcbiAgICBwcml2YXRlICBoaWQ6IEhJRC5ISUQ7XHJcblxyXG4gICAgcHJpdmF0ZSByZXBvcnRlcjogVVNCUmVwb3J0ZXI7XHJcblxyXG5cclxuICAgIHByaXZhdGUgUE9MTF9JTlRFUlZBTDogbnVtYmVyID0gNV8wMDA7XHJcblxyXG4gICAgLy8gcHJpdmF0ZSBQT0xMX0lOVEVSVkFMOiBudW1iZXIgPSBTZXR0aW5ncy5nZXQoJ1BPTExfSU5URVJWQUwnKS52YWx1ZSB8IDUwMDA7XHJcbiAgICBwcml2YXRlIE1BWF9TQU1QTEVfUkFURSA9IDEvdGhpcy5QT0xMX0lOVEVSVkFMO1xyXG4gICAgcHJpdmF0ZSBkZXZpY2VJbml0aWFsaXplZCA9IGZhbHNlO1xyXG5cclxuICAgIHByaXZhdGUgdGltZXI6IE5vZGVKUy5UaW1lcjtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihoaWQ6IEhJRC5ISUQsIHJlcG9ydGVyOiBVU0JSZXBvcnRlcikge1xyXG4gICAgICAgIHRoaXMuaGlkID0gaGlkO1xyXG4gICAgICAgIHRoaXMucmVwb3J0ZXIgPSByZXBvcnRlcjtcclxuICAgICAgICB0aGlzLk1BWF9TQU1QTEVfUkFURSA9IHJlcG9ydGVyLm1heFNhbXBsZVJhdGUoKTtcclxuICAgICAgICBpZiAodGhpcy5zYW1wbGVSYXRlKCkgPiB0aGlzLk1BWF9TQU1QTEVfUkFURSkge1xyXG4gICAgICAgICAgICB0aGlzLlBPTExfSU5URVJWQUwgPSAxXzAwMCAqIDEvdGhpcy5NQVhfU0FNUExFX1JBVEU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFNldHRpbmdzLm9uQ2hhbmdlKFNldHRpbmdzLlBPTExfSU5URVJWQUwsIHRoaXMucG9sbEludGVydmFsQ2hhbmdlZC5iaW5kKHRoaXMpKTtcclxuICAgICAgICB0aGlzLmluaXRpYWxpemVEZXZpY2UoKTtcclxuICAgICAgICB0aGlzLnBvbGxTZW5zb3JzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBwb2xsSW50ZXJ2YWxDaGFuZ2VkKHNldHRpbmc6IFNldHRpbmcpIHtcclxuICAgICAgICBjb25zdCBwb2xsSW50ZXJ2YWwgPTxudW1iZXI+c2V0dGluZy52YWx1ZTtcclxuICAgICAgICBjb25zdCBzYW1wbGVSYXRlID0gMS8ocG9sbEludGVydmFsLzFfMDAwKTtcclxuXHJcbiAgICAgICAgaWYgKHNhbXBsZVJhdGUgPCB0aGlzLk1BWF9TQU1QTEVfUkFURSkge1xyXG4gICAgICAgICAgICB0aGlzLlBPTExfSU5URVJWQUwgPSBwb2xsSW50ZXJ2YWw7XHJcbiAgICAgICAgICAgIGxvZy5pbmZvKCdVU0JEZXZpY2UucG9sbEludGVydmFsQ2hhbmdlZCB0bycgKyBwb2xsSW50ZXJ2YWwpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHB1YmxpYyBpbml0aWFsaXplRGV2aWNlKCkge1xyXG4gICAgICAgIGlmICghdGhpcy5kZXZpY2VJbml0aWFsaXplZCkge1xyXG4gICAgICAgICAgICB0aGlzLmhpZC5vbignZGF0YScsIHRoaXMucGFyc2VJbnB1dC5iaW5kKHRoaXMpKTtcclxuICAgICAgICAgICAgdGhpcy5oaWQub24oJ2Vycm9yJywgdGhpcy5wYXJzZUVycm9yLmJpbmQodGhpcykpO1xyXG4gICAgICAgICAgICB0aGlzLnNldFBvbGxpbmdJbnRlcnZhbCh0aGlzLlBPTExfSU5URVJWQUwpO1xyXG4gICAgICAgICAgICBsb2cuZGVidWcoJ1VTQkRldmljZS5pbml0aWFsaXplRGV2aWNlIFBPTExJTkcgSU5URVJWQUw9JyArIHRoaXMuUE9MTF9JTlRFUlZBTCk7XHJcbiAgICAgICAgICAgIHRoaXMuZGV2aWNlSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICBsb2cuaW5mbygnVVNCRGV2aWNlLmluaXRpYWxpemVEZXZpY2UgZG9uZScpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgY2xvc2UoKSB7XHJcbiAgICAgICAgdGhpcy5kZXZpY2VJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkLnBhdXNlKCk7XHJcbiAgICAgICAgICAgIHRoaXMuaGlkLmNsb3NlKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc2FtcGxlUmF0ZSgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiAxLyh0aGlzLlBPTExfSU5URVJWQUwvMV8wMDApO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXRQb2xsaW5nSW50ZXJ2YWwobXM6IG51bWJlcikge1xyXG4gICAgICAgIHRoaXMuUE9MTF9JTlRFUlZBTCA9IG1zO1xyXG4gICAgICAgIGlmICh0aGlzLnNhbXBsZVJhdGUoKSA+IHRoaXMuTUFYX1NBTVBMRV9SQVRFKSB7XHJcbiAgICAgICAgICAgIHRoaXMuUE9MTF9JTlRFUlZBTCA9IDFfMDAwICogMS90aGlzLk1BWF9TQU1QTEVfUkFURTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY2xlYXJJbnRlcnZhbCh0aGlzLnRpbWVyKTtcclxuICAgICAgICB0aGlzLnRpbWVyID0gc2V0SW50ZXJ2YWwodGhpcy5wb2xsU2Vuc29ycy5iaW5kKHRoaXMpLCB0aGlzLlBPTExfSU5URVJWQUwpO1xyXG4gICAgICAgIGxvZy5pbmZvKCdVU0JEZXZpY2Uuc2V0UG9sbGluZ0ludGVydmFsOicgKyBtcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldFBvbGxpbmdJbnRlcnZhbCgpOiBudW1iZXIge1xyXG4gICAgICAgIHJldHVybiB0aGlzLlBPTExfSU5URVJWQUw7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGhpcyBpcyB3ZXJlIGFsbCBzdGFydHMgd2hlbiBzZXQgaW50ZXJ2YWwgdGltZSBleHBpcmVzXHJcbiAgICBwcml2YXRlIHBvbGxTZW5zb3JzKCkge1xyXG4gICAgICAgIGlmICghIHRoaXMuZGV2aWNlSW5pdGlhbGl6ZWQpIHtcclxuICAgICAgICAgICAgdGhpcy5pbml0aWFsaXplRGV2aWNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbG9nLmRlYnVnKCcrKysgVVNCQ29udHJvbGxlci5wb2xsU2Vuc29ycycpO1xyXG4gICAgICAgICAgICBjb25zdCBpbml0Q29tbWFuZHMgPSB0aGlzLnJlcG9ydGVyLmluaXRXcml0ZVJlcG9ydCgpO1xyXG4gICAgICAgICAgICBmb3IgKGNvbnN0IGNvbW1hbmQgb2YgaW5pdENvbW1hbmRzKSB7XHJcbiAgICAgICAgICAgICAgICB0aGlzLndyaXRlUmVwb3J0KGNvbW1hbmQpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgLy8gQ2FsbGVkIGZyb20gSElELCBQYXJzZXMgaW5wdXQgZnJvbSBISUQgYW5kIHdyaXRlcyBhbnkgcmVzcG9uc2UgbWVzc2FnZXNcclxuICAgIC8vIGJhY2sgdG8gdGhlIGRldmljZVxyXG4gICAgcHJpdmF0ZSBwYXJzZUlucHV0KGRhdGE6IG51bWJlcltdKTogdm9pZCAge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHJlc3BvbnNlID0gdGhpcy5yZXBvcnRlci5yZWFkUmVwb3J0KGRhdGEpO1xyXG4gICAgICAgICAgICBpZiAocmVzcG9uc2UubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy53cml0ZVJlcG9ydChyZXNwb25zZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgICAgIC8vIFRPRE8gZXJyb3IgaGFuZGxpbmcgaWYgcGFyc2UgaW5wdXQgZXJyb3JcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHByaXZhdGUgcGFyc2VFcnJvcihfZXJyb3I6IGFueSkge1xyXG4gICAgICAgIGxvZy5lcnJvcigncGFyc2VFcnJvcjogJywgX2Vycm9yKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zIHRvIHdyaXRlIHJlcG9ydHMgdG8gdGhlIGRldmljZVxyXG4gICAgcHJpdmF0ZSB3cml0ZVJlcG9ydChkYXRhOiBudW1iZXJbXSk6IHZvaWQge1xyXG5cclxuICAgICAgICBpZiAob3MucGxhdGZvcm0oKSA9PT0gJ3dpbjMyJykge1xyXG4gICAgICAgICAgICBkYXRhLnVuc2hpZnQoMCk7ICAvLyBwcmVwZW5kIGEgdGhyb3dhd2F5IGJ5dGVcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIE91dHB1dCByZXBvcnRcclxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IDE7IGkrKykge1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgdGhpcy5oaWQud3JpdGUoZGF0YSk7XHJcbiAgICAgICAgICAgICAgICBsb2cuZGVidWcoJysrKyBVU0JDb250cm9sbGVyLndyaXRlUmVwb3J0JywgZGF0YSk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgICAgICAgIGxvZy5lcnJvcignKioqIFVTQkNvbnRyb2xsZXIud3JpdGVSZXBvcnQgaGlkLndyaXRlIGNhdGNoOiZkJywgZGF0YSk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLmNsb3NlKCk7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XHJcbiJdfQ==
