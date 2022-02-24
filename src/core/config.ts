import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as os from 'os';
import { config } from 'process';

interface Options {
    BLUETOOTH: string;
    COLOR: string;
    SERIAL_NUMBER: string;
    ITEMPER_URL: string;
    WS_URL: string;
    WS_ORIGIN: string;
    POLL_INTERVAL: string;
    ERROR_LOG_FILE: string;
    ERROR_LEVEL: string;
    CONSOLE_LEVEL: string;
    HOSTNAME: string;
    RUUVI_TAGS: string;
    SHARED_ACCESS_KEY: string;
    ITEMPER_CONFIG_FILE: string;
    ITEMPER_PERSIST_DIR: string;
}
class Config implements Options {
    private static env: Partial<Options>;
    private static options: Options = Config.defaults();
    constructor() {
        this.reset();
        this.readSharedKey();
    }
    private static defaults(): Options {
        return {
            BLUETOOTH: (process.arch === 'arm' || process.arch === 'arm64')? process.arch : '',
            COLOR: '#00AA00FF',
            SERIAL_NUMBER: os.hostname(),
            ITEMPER_URL: 'https://userapi.itemper.io',
            WS_URL: 'wss://userapi.itemper.io/ws',
            WS_ORIGIN: 'https://itemper.io',
            POLL_INTERVAL: '60000',
            ERROR_LOG_FILE: 'itemper-error.log',
            ERROR_LEVEL: 'info',
            CONSOLE_LEVEL: 'info',
            HOSTNAME:  os.hostname(),
            RUUVI_TAGS: '', 
            SHARED_ACCESS_KEY: '',
            ITEMPER_CONFIG_FILE: './itemper.config',
            ITEMPER_PERSIST_DIR: './data',
        } ;
    
    } 
    private reset() {
        Config.env = {
            BLUETOOTH: process.env.BLUETOOTH, // set to true/Linux to enable if not process.arch as defaults above
            COLOR: process.env.COLOR,
            SERIAL_NUMBER: process.env.SERIAL_NUMBER,
            ITEMPER_URL : process.env.ITEMPER_URL,
            WS_URL : process.env.WS_URL,
            WS_ORIGIN : process.env.WS_ORIGI,
            POLL_INTERVAL : process.env.POLL_INTERVAL,
            ERROR_LOG_FILE : process.env.ERROR_LOG_FIL,
            ERROR_LEVEL : process.env.ERROR_LEVEL,
            CONSOLE_LEVEL : process.env.CONSOLE_LEVEL,
            HOSTNAME : process.env.HOSTNAME,
            RUUVI_TAGS: process.env.RUUVI_TAGS,  // set to true to enable
            SHARED_ACCESS_KEY: process.env.SHARED_ACCESS_KEY,
            ITEMPER_CONFIG_FILE: process.env.ITEMPER_CONFIG_FIL,
            ITEMPER_PERSIST_DIR: process.env.ITEMPER_PERSIST_DIR,
        };
        let key: keyof Options;
        for (key in Config.options){
            if (Config.env[key]){
                Config.options[key] = <string>Config.env[key]; 
                console.info(chalk.yellow('Config.reset: Found environment variable ' + key + '=' + Config.options[key])); 
           } 
           else{
            console.info(chalk.green('Config.reset: Using defaults for ' + key + '=' + Config.options[key])); 
           } 
        } 
    }
    
    get BLUETOOTH() :string { return Config.options.BLUETOOTH; }

    get COLOR() { return Config.options.COLOR; }
    set COLOR(value: string) { Config.options.COLOR=value; }

    get SERIAL_NUMBER() { return Config.options.SERIAL_NUMBER; }
    set SERIAL_NUMBER(value: string) { Config.options.SERIAL_NUMBER=value; }

    get ITEMPER_URL(): string { return Config.options.ITEMPER_URL; }

    get WS_URL(): string { return Config.options.WS_URL; }

    get WS_ORIGIN(): string { return Config.options.WS_ORIGIN; }

    get POLL_INTERVAL(): string { return Config.options.POLL_INTERVAL; }
    set POLL_INTERVAL(value: string) { Config.options.POLL_INTERVAL = value }

    get ERROR_LOG_FILE() { return Config.options.ERROR_LOG_FILE; }

    get ERROR_LEVEL() { return Config.options.ERROR_LEVEL; }

    get CONSOLE_LEVEL() { return Config.options.CONSOLE_LEVEL; }

    get HOSTNAME() { return Config.options.HOSTNAME; }

    get RUUVI_TAGS(): string { return Config.options.RUUVI_TAGS; }

    public get SHARED_ACCESS_KEY(): string { return Config.options.SHARED_ACCESS_KEY; }
    public set SHARED_ACCESS_KEY(value: string) { Config.options.SHARED_ACCESS_KEY=value; this.saveSharedKey(value); }

    get ITEMPER_CONFIG_FILE() { return Config.options.ITEMPER_CONFIG_FILE; }
    
    get ITEMPER_PERSIST_DIR() { return Config.options.ITEMPER_PERSIST_DIR ; }

    private readSharedKey(): void {
        try {
            const conf = fs.readJSONSync(this.ITEMPER_CONFIG_FILE);
            console.info(chalk.yellow('config.readSharedKey: Found conf=' + JSON.stringify(conf)));
            Config.options.SHARED_ACCESS_KEY = conf.SHARED_ACCESS_KEY;       // no implicit saving here
        } catch (error) {
            const msg = 'config.readSharedKey: Cannot read SHARED_ACCESS_KEY from ' + this.ITEMPER_CONFIG_FILE;
            console.error(chalk.red(msg));
        }
    }
    public saveSharedKey(key: string): void {
        try {
            const conf =  { SHARED_ACCESS_KEY:key };
            fs.writeJSONSync( this.ITEMPER_CONFIG_FILE, conf);
            console.info(chalk.yellow('config.writeSharedKey: saved conf=' + JSON.stringify(conf)));
        } catch (error) {
            const msg =  'config.saveSharedKey: cannot save SHARED_ACCESS_KEY to ' + this.ITEMPER_CONFIG_FILE;
            console.error(chalk.red(msg));
        }
    }
}

export const conf = new Config();

