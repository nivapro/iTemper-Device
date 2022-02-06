import chalk from 'chalk';
import * as fs from 'fs-extra';
import * as os from 'os';

interface Options {
    _PRIMARY_SERVICE: string;
    _COLOR?: string;
    _SERIAL_NUMBER?: string;
    _ITEMPER_URL?: string;
    _WS_URL?: string;
    _WS_ORIGIN?: string;
    _AZURE_CONNECTION_STRING?: string;
    _POLL_INTERVAL?: string;
    _ERROR_LOG_FILE?: string;
    _ERROR_LEVEL?: string;
    _CONSOLE_LEVEL?: string;
    _HOSTNAME?: string;
    _RUUVI_TAGS?: string;
    _SHARED_ACCESS_KEY?: string;
    _ITEMPER_CONFIG_FILE?: string;
    _ITEMPER_PERSIST_DIR?: string;
}
class Config {
    private static env: Options;

    constructor() {
        this.reset();
        this.readSharedKey();
    }
    private reset() {
        Config.env = {
            _PRIMARY_SERVICE: process.env.PRIMARY_SERVICE || '',
            _COLOR: process.env.COLOR|| '#0000cc',
            _SERIAL_NUMBER: process.env.SERIAL_NUMBER || os.hostname(),
            _ITEMPER_URL : process.env.ITEMPER_URL,
            _WS_URL : process.env.WS_URL,
            _WS_ORIGIN : process.env.WS_ORIGIN,
            _AZURE_CONNECTION_STRING : process.env.AZURE_CONNECTION_STRING,
            _POLL_INTERVAL : process.env.POLL_INTERVAL,
            _ERROR_LOG_FILE : process.env.ERROR_LOG_FILE || 'itemper-error.log',
            _ERROR_LEVEL : process.env.ERROR_LEVEL,
            _CONSOLE_LEVEL : process.env.CONSOLE_LEVEL,
            _HOSTNAME : os.hostname(),
            _RUUVI_TAGS: process.env.RUUVI_TAGS,
            _SHARED_ACCESS_KEY: process.env.SHARED_ACCESS_KEY,
            _ITEMPER_CONFIG_FILE: process.env.ITEMPER_CONFIG_FILE,
            _ITEMPER_PERSIST_DIR: process.env.ITEMPER_PERSIST_DIR,
           };
    }
    get PRIMARY_SERVICE() { return Config.env._PRIMARY_SERVICE || ''; }
    set PRIMARY_SERVICE(value: string) { Config.env._PRIMARY_SERVICE = value; }
    get BLUETOOTH() :boolean { return (process.arch === 'arm' || process.arch === 'arm64'); }
    get COLOR() { return Config.env._COLOR || ''; }
    set COLOR(value: string) { Config.env._COLOR=value; }

    get SERIAL_NUMBER() { return Config.env._SERIAL_NUMBER || ''; }
    set SERIAL_NUMBER(value: string) { Config.env._SERIAL_NUMBER=value; }

    get ITEMPER_URL(): string { return Config.env._ITEMPER_URL || ''; }

    get WS_URL(): string { return Config.env._WS_URL || ''; }

    get WS_ORIGIN(): string { return Config.env._WS_ORIGIN || ''; }

    get AZURE_CONNECTION_STRING(): string { return Config.env._AZURE_CONNECTION_STRING || ''; }

    get POLL_INTERVAL(): number {
        if (!Config.env._POLL_INTERVAL) {
            return 60000;
        } else {
            return +Config.env._POLL_INTERVAL;
        }
    }
    set POLL_INTERVAL(value: number) { Config.env._POLL_INTERVAL = value.toString(); }

    get ERROR_LOG_FILE() { return Config.env._ERROR_LOG_FILE; }

    get ERROR_LEVEL() { return Config.env._ERROR_LEVEL; }

    get CONSOLE_LEVEL() { return Config.env._CONSOLE_LEVEL; }

    get HOSTNAME() { return Config.env._HOSTNAME; }

    get RUUVI_TAGS(): boolean { return Config.env._RUUVI_TAGS?.toLowerCase() === 'true'; }

    public get SHARED_ACCESS_KEY(): string { return Config.env._SHARED_ACCESS_KEY || ''; }
    public set SHARED_ACCESS_KEY(value: string) { Config.env._SHARED_ACCESS_KEY=value; this.saveSharedKey(value); }

    get ITEMPER_CONFIG_FILE() { return Config.env._ITEMPER_CONFIG_FILE || '/data/itemper.json'; }
    get ITEMPER_PERSIST_DIR() { return Config.env._ITEMPER_PERSIST_DIR || '/data/persist'; }

    private readSharedKey(): void {
        try {
            const conf = fs.readJSONSync(this.ITEMPER_CONFIG_FILE);
            console.info(chalk.yellow('config.readSharedKey: Found conf=' + JSON.stringify(conf)));
            Config.env._SHARED_ACCESS_KEY = conf.SHARED_ACCESS_KEY;       // no implicit saving here
        } catch (error) {
            this.SHARED_ACCESS_KEY = process.env.SHARED_ACCESS_KEY || ''; // implicit saving the key to config file here
        }
    }
    public saveSharedKey(key: string): void {
        console.log(this.BLUETOOTH);
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

