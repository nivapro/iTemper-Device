import { Application } from './gatt-application';
import { Characteristic } from './gatt-characteristic';
import { Service } from './gatt-service';

import { log } from './../../../core/logger';

const DOMAIN = '/io/itemper';
const SERVICE0_UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900000';
const CHARACTERISTIC0_UUID = '1ad01b31-dd4b-478c-9aa3-12bd90900001';

const app = new Application(DOMAIN);
const service0 = new Service(SERVICE0_UUID, app);

class Characteristic0 extends Characteristic {
    constructor() {
        super(CHARACTERISTIC0_UUID, ['Read'], service0);
    }
    protected ReadValue(): Buffer {
        const value = 'Hej hopp i lingonskogen';
        return Buffer.from(value);
    }
}
const characteristic0 = new Characteristic0();

// Publish on DBus
export async function init() {
    await app.publish();
    log.debug('characteristic0 properties:' + JSON.stringify(characteristic0.getProperties));
    log.debug('service0 properties:' + JSON.stringify(service0.getProperties));
}




