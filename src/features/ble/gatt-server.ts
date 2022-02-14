import { Application } from './gatt/gatt-application';
import { Characteristic } from './gatt/gatt-characteristic';
import { Service } from './gatt/gatt-service';

import { log } from '../../core/logger';
const m = "gattserver"
function label(f: string = ""){
    return m + "." + f + ": ";
} 
import { getUuid, UUID_Designator} from './ble-uuid';

const DOMAIN_PATH = '/io/itemper'; 
//
// All services, characteristics, and descriptors are located under this path.

const SERVICE0_UUID = getUuid(UUID_Designator.PrimaryService);;

const app = new Application(DOMAIN_PATH);
const service0 = new Service(SERVICE0_UUID, app);

class Characteristic0 extends Characteristic<string> {
    static UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900001';
    private _value = 'Hej hopp i lingonskogen 0';
    constructor(protected _service: Service) {
        super(_service, Characteristic0.UUID, ['read']);
        this.setReadFn (this.read);
    }
    private read(): Promise<string> {
        return new Promise (resolve => resolve(this._value))
    } 
}
class Characteristic1 extends Characteristic<string> {
    static UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900002';
    private _value = 'Hej hopp i lingonskogen 1';
    constructor(protected _service: Service) {
        super(_service, Characteristic1.UUID, ['read', 'write']);
        this.setReadFn (this.read);
        this.setWriteFn(this.write, this.isValid);
    }
    private read(): Promise<string> {
        return new Promise (resolve => resolve(this._value))
    } 
    public isValid(data: unknown): boolean {
        return typeof data === 'string'
    } 
    public write(value: string): Promise<void> {
        return new Promise (resolve =>{ 
            this._value = value;
            log.info(label('write') + 'value=' + this._value);
            resolve();
        });
    }
}

const characteristic0 = new Characteristic0(service0);
const characteristic1 = new Characteristic1(service0);

export async function init() {
    await app.init();
    // log.info('characteristic0 properties:' + JSON.stringify(characteristic0.getProperties()));
    // log.info('characteristic0 properties:' + JSON.stringify(characteristic1.getProperties()));
    // log.info('service0 properties:' + JSON.stringify(service0.getProperties()));
}




