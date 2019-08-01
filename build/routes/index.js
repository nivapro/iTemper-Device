"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Router();
var logger_1 = require("./../logger");
router.get('/', function (_req, res) {
    logger_1.log.debug('GET /');
    res.sendFile('./index.html');
});
exports.default = router;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yb3V0ZXMvaW5kZXgudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSxpQ0FBb0M7QUFDcEMsSUFBTSxNQUFNLEdBQW1CLE9BQU8sQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUloRCxzQ0FBa0M7QUFFbEMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUUsVUFBQyxJQUFxQixFQUFFLEdBQXFCO0lBQ3pELFlBQUcsQ0FBQyxLQUFLLENBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEIsR0FBRyxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsQ0FBQztBQXNCakMsQ0FBQyxDQUFDLENBQUM7QUFFSCxrQkFBZSxNQUFNLENBQUMiLCJmaWxlIjoicm91dGVzL2luZGV4LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcclxuICogR0VUIGhvbWUgcGFnZS5cclxuICovXHJcbmltcG9ydCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpO1xyXG5jb25zdCByb3V0ZXI6IGV4cHJlc3MuUm91dGVyID0gZXhwcmVzcy5Sb3V0ZXIoKTtcclxuXHJcbi8vIGltcG9ydCB7IFVTQkNvbnRyb2xsZXIgfSBmcm9tICcuLi9tb2RlbHMvdXNiLWNvbnRyb2xsZXInO1xyXG5cclxuaW1wb3J0IHsgbG9nIH0gZnJvbSAnLi8uLi9sb2dnZXInO1xyXG5cclxucm91dGVyLmdldCgnLycsIChfcmVxOiBleHByZXNzLlJlcXVlc3QsIHJlczogZXhwcmVzcy5SZXNwb25zZSkgPT4ge1xyXG4gICAgbG9nLmRlYnVnICgnR0VUIC8nKTtcclxuICAgIHJlcy5zZW5kRmlsZSgnLi9pbmRleC5odG1sJyk7XHJcbiAgICAvLyBjb25zdCBzZW5zb3JMb2dnZXIgPSBVU0JDb250cm9sbGVyLmdldExvZ2dlcnMoKVxyXG4gICAgLy8gICAgIC5maW5kKGxvZ2dlcj0+IGxvZ2dlci5nZXRTdGF0ZSAhPT0gdW5kZWZpbmVkKTtcclxuXHJcblxyXG4gICAgLy8gaWYgKHNlbnNvckxvZ2dlciAmJiBzZW5zb3JMb2dnZXIuZ2V0U3RhdGUoKSkge1xyXG4gICAgLy8gICAgIGNvbnN0IHNlbnNvckRhdGEgPSBzZW5zb3JMb2dnZXIuZ2V0U3RhdGUoKS5nZXRTZW5zb3JEYXRhKCk7XHJcbiAgICAvLyAgICAgY29uc3Qgc2Vuc29yRGF0YVN0cmluZyA9IEpTT04uc3RyaW5naWZ5KHNlbnNvckRhdGEpO1xyXG4gICAgLy8gICAgIGxvZy5kZWJ1ZyAoJ0dFVCAvIFNlbnNvciBkYXRhIGZvdW5kJyk7XHJcbiAgICAvLyAgICAgcmVzLnJlbmRlcignaW5kZXgnLCB7XHJcbiAgICAvLyAgICAgICAgIHRpdGxlOiAnU2Vuc29yIERhdGEnLFxyXG4gICAgLy8gICAgICAgICBkYXRhOiBzZW5zb3JEYXRhU3RyaW5nLFxyXG4gICAgLy8gICAgIH0pO1xyXG5cclxuICAgIC8vIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgbG9nLmRlYnVnICgnR0VUIC8gU2Vuc29yIGRhdGEgTk9UIGZvdW5kJyk7XHJcbiAgICAvLyAgICAgcmVzLnJlbmRlcignaW5kZXgnLCB7XHJcbiAgICAvLyAgICAgICAgIHRpdGxlOiAnU2Vuc29yIGRhdGEnLFxyXG4gICAgLy8gICAgICAgICBkYXRhOiAnbm90IGZvdW5kJyxcclxuICAgIC8vICAgICB9KTtcclxuICAgIC8vIH1cclxuXHJcbn0pO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgcm91dGVyO1xyXG4iXX0=
