import * as dbus from 'dbus-next';
import { log } from '../../core/logger';
import * as bluez from '../ble/bluez';

export class DeviceDiscovery {
    private Device1 = 'org.bluez.Device1';
    private devices: { [key: string]: any } = {};
    private dbusObjectManager: bluez.OrgfreedesktopDBusObjectManager;
    private adapter: bluez.Adapter1;
    initiated = false;
    constructor(private _bus: dbus.MessageBus) {
        log.debug('DeviceDiscovery created');
        return;
    }
    async startDiscovery() {
        log.debug('DeviceDiscovery.startDiscovery: eventnames=' + this._bus.eventNames());
        if (!this.initiated) {
            log.debug('DeviceDiscovery.startDiscovery' + this._bus.eventNames());
            
            this.dbusObjectManager = await bluez.OrgfreedesktopDBusObjectManager.Connect(this._bus);
            log.debug('DeviceDiscovery.startDiscovery dbusObjectManager connected');
            // @signal({ name: 'InterfacesAdded', signature: 'oa{sa{sv}}' })
            this.dbusObjectManager.on('InterfacesAdded',
                                       (path: dbus.ObjectPath, interfaces: /* a{sa{sv}} */ {[key: string]: any}) => {
                if (!(this.Device1 in interfaces)) {
                    return;
                }
                log.info('InterfacesAdded: found device: ' + path);
                const deviceProperties = interfaces[this.Device1];
                if (!(path in this.devices)) {
                    log.info('InterfacesAdded: device: ' + path);
                    this.devices[path] = deviceProperties;
                    bluez.OrgfreedesktopDBusProperties.Connect(this._bus, path).then((device) => {
                        device.on('PropertiesChanged', (iface: string,
                                                        changedProperties: {[key: string]: dbus.Variant },
                                                        invalidatedProperties: string[]) => {
                            if (iface !== this.Device1) {
                                return;
                            }
                            log.info('PropertiesChanged: device changed properties:' +
                                      JSON.stringify(changedProperties));
                            log.info('PropertiesChanged: device invalidated properties:' +
                                      JSON.stringify(invalidatedProperties));
                        });
                    });
                    log.info('InterfacesAdded: device properties:' + JSON.stringify(deviceProperties));
                }
            });
            this.dbusObjectManager.on('InterfacesRemoved',
                                       (path: dbus.ObjectPath, interfaces: /* a{sa{sv}} */ {[key: string]: any}) => {
                if (!(this.Device1 in interfaces)) {
                    return;
                }
                if (path in this.devices) {
                    this.devices[path] = undefined;
                    log.info('InterfacesRemoved: device: ' + path);
                }

            });
            this.adapter = await bluez.Adapter1.Connect(this._bus);
            log.debug('DeviceDiscovery.startDiscovery adapter connected');
            this.initiated = true;
        }
        await this.adapter.StartDiscovery();
        log.debug('DeviceDiscovery.startDiscovery adapter startDiscovery');
    }
    async stopDiscovery() {
        this.adapter.StopDiscovery();
    }
}
