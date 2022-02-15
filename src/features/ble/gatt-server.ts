import * as gatt from './gatt'

import { log } from '../../core/logger';
const m = "gattserver"
function label(f: string = ""){
    return m + "." + f + ": ";
} 
import { getUuid, UUID_Designator} from './ble-uuid';


class Characteristic0 extends gatt.Characteristic<string> {
    static UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900001';
    private _value = 'Hej hopp i lingonskogen 0';
    constructor(protected _service: gatt.Service) {
        super(_service, Characteristic0.UUID);
        this.enableReadValue (this.read);
    }
    private read(): Promise<string> {
        return new Promise (resolve => resolve(this._value))
    } 
}
class Characteristic1 extends gatt.Characteristic<string> {
    static UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900002';
    private _value = 'Hej hopp i lingonskogen 1';
    constructor(protected _service: gatt.Service) {
        super(_service, Characteristic1.UUID);
        this.enableReadValue (this.read);
        this.enableWriteValue(this.write, this.isValid);
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
const DOMAIN_PATH = '/io/itemper'; 
export const SERVICE0_UUID = '1ad01b31-dd4b-478c-9aa3-12bd90901000';

export class GattServer {
    _app = new gatt.Application(DOMAIN_PATH);
    _service0 = new gatt.Service(SERVICE0_UUID, this._app);
    _char0 = new Characteristic0(this._service0);
    _char1 = new Characteristic1(this._service0);
    public init(){
        this._app.init();
    } 
} 




