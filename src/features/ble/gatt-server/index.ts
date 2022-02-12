import { Application } from './gatt-application';
import { Characteristic } from './gatt-characteristic';
import { Service } from './gatt-service';
import { decode } from './gatt-utils';

import { log } from './../../../core/logger';

class Characteristic0 extends Characteristic {
    static UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900001';
    private _value = 'Hej hopp i lingonskogen 0';
    constructor(protected _service: Service) {
        super(Characteristic0.UUID, ['read'], _service);
        this.overrideReadValue (this.ReadValue);
    }
    protected ReadValue(): Buffer {
        return Buffer.from(this._value);
    }
}
class Characteristic1 extends Characteristic {
    static UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900002';
    private _value = 'Hej hopp i lingonskogen 1';
    constructor(protected _service: Service) {
        super(Characteristic1.UUID, ['read'], _service);
        this.overrideReadValue (this.ReadValue);
    }
    protected ReadValue(): Buffer {
        return Buffer.from(this._value);
    }
    protected WriteValue(value: Buffer): void {
        const newValue = decode(value);
        this._value = newValue;
    }
}
const DOMAIN_PATH = '/io/itemper';
const SERVICE0_UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900000';
const app = new Application(DOMAIN_PATH);
const service0 = new Service(SERVICE0_UUID, app);
const characteristic0 = new Characteristic0(service0);
const characteristic1 = new Characteristic1(service0);

// Publish on DBus
export async function init() {
    await app.publish();
    // log.info('characteristic0 properties:' + JSON.stringify(characteristic0.getProperties()));
    // log.info('characteristic0 properties:' + JSON.stringify(characteristic1.getProperties()));
    // log.info('service0 properties:' + JSON.stringify(service0.getProperties()));
}




