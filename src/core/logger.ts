import chalk from 'chalk';
import { conf } from './config';

import { createLogger, format, Logger, transports} from 'winston';
const { combine, timestamp, printf, label } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
  const msg = `${level}: ${timestamp} [${label}]: ${message}`;
  return level === 'error' ? chalk.red(msg) : level === 'info' ? chalk.green(msg) : msg;
});

console.log(chalk.yellow('conf.ERROR_LOG_FILE=' + conf.ERROR_LOG_FILE));
const trans = {
    file: new transports.File({ filename: conf.ERROR_LOG_FILE,
                                level: conf.ERROR_LEVEL }),
    console: new (transports.Console)(),
};

export const log: Logger =  createLogger ({
    format: combine (timestamp(), label ({ label: 'iTemper-device:' +
                                           conf.HOSTNAME}), myFormat),
    exitOnError: false,
    level: conf.CONSOLE_LEVEL,
    transports: [
        trans.file,
        trans.console,
    ],
  });
  export const wLog: Logger =  createLogger ({
    format: combine (timestamp(), label ({ label: 'iTemper-device.WiFi:' +
                                           conf.HOSTNAME}), myFormat),
    exitOnError: false,
    level: 'info',
    transports: [
        trans.console,
    ],
  });
export function setLevel(level: string): void {
    log.transports[1].level = level;
}

export function getLevel(): string {
  return log.transports[1].level + '';
}
