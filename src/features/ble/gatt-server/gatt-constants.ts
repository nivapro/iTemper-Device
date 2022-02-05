import dbus from 'dbus-next';

export const ADAPTER_NAME = 'hci0';

export const BLUEZ_SERVICE_NAME = 'org.bluez';
export const BLUEZ_NAMESPACE = '/org/bluez/';

export const ITEMPER_SERVICE_NAME = 'io.itemper';
export const ITEMPER_NAMESPACE = '/io/itemper';


export const DBUS_PROP_IFACE ='org.freedesktop.DBus.Properties';
export const DBUS_OM_IFACE = 'org.freedesktop.DBus.ObjectManager';


export const ADAPTER_INTERFACE = BLUEZ_SERVICE_NAME + '.Adapter1';
export const DEVICE_INTERFACE = BLUEZ_SERVICE_NAME + '.Device1';

export const GATT_CHARACTERISTIC_INTERFACE = BLUEZ_SERVICE_NAME + '.GattCharacteristic1';
export const GATT_DESCRIPTOR_INTERFACE = BLUEZ_SERVICE_NAME + '.GattDescriptor1';
export const GATT_MANAGER_INTERFACE = BLUEZ_SERVICE_NAME + '.GattManager1';
export const GATT_SERVICE_INTERFACE = BLUEZ_SERVICE_NAME + '.GattService1';

export const ADVERTISEMENT_INTERFACE = BLUEZ_SERVICE_NAME + '.LEAdvertisement1';
export const ADVERTISING_MANAGER_INTERFACE = BLUEZ_SERVICE_NAME + '.LEAdvertisingManager1';

// System bus
export const BUS_NAME = 'io.itemper';
export const systemBus = dbus.systemBus();
systemBus.requestName(BUS_NAME, 0);

