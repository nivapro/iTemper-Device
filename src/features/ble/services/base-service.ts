import dbus from 'dbus-next';
// org.bluez.GattService1 interface implementation
export abstract class BaseService extends dbus.interface.Interface {
    path: string;
    constructor(bus: dbus.MessageBus, pathBase: string, index: number, uuid: string, primary: boolean) {
        super();
        this.path = pathBase + '/service' + index;
    }
}
