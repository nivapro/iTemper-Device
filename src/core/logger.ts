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

export const AddFileTransport = true;
export const newLogger = (component = '', myLevel = conf.CONSOLE_LEVEL, fileTransport = AddFileTransport): Logger => {
  const mylabel = component === ''
    ? label ({ label: 'iTemper-device:' + conf.HOSTNAME})
    : label ({ label: 'iTemper-device.' + component +':'+ conf.HOSTNAME});
  const myTransports = fileTransport
    ? [trans.file, trans.console]
    : [trans.console];
  return createLogger ({
    format: combine (timestamp(), mylabel, myFormat),
    exitOnError: false,
    level: myLevel,
    transports: myTransports,
  });
} 

interface ComponentLoggers {
 [component: string]: Logger; 
} 
export const componentLoggers: ComponentLoggers = {};

export function newComponentLogger(component: string): Logger {
  if ((component in componentLoggers) || component.length === 0){
    throw new Error('Component logger exists already or invalid component name length')
  }
  const logger = newLogger(component, conf.CONSOLE_LEVEL, !AddFileTransport);
  componentLoggers[component]  = logger;
  return logger;
}  

export const log: Logger =  newLogger ();

export const wLog: Logger =  newComponentLogger('WiFi');

export function setLevel(level: string, component = ''): void {
  if (component === '') {
    log.transports[1].level = level;
  } else if (component in componentLoggers){
    componentLoggers[component].transports[0].level = level;
  } else{
    throw new Error('Component logger does not exist')
  }
}

export function getLevel(component = ''): string {
  if (component === '') {
    return log.transports[1].level + '';
  } else if (component in componentLoggers){
    return componentLoggers[component].transports[0].level + '';
  } else{
    throw new Error('Component logger does not exist')
  }
}
