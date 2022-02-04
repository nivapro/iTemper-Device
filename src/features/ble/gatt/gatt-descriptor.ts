import dbus from 'dbus-next';

export class Descriptor {
    GATT_CHARACTERISTIC_IFACE= 'org.bluez.GattDescriptor1';
    _path: string = '';
    _descriptors: Descriptor[] =[];
    _iface: dbus.interface.Interface;

    public getPath(): string {
        return this._path;
    }

}