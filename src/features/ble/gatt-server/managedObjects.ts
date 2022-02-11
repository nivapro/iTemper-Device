
type variant = string | number| boolean | Array<string> 
type Property ={
   [key: string] : variant; 
} 
const managedObjects = {
    '/org/bluez': {
        'org.bluez.AgentManager1': {},
        'org.bluez.ProfileManager1': {},
        'org.freedesktop.DBus.Introspectable': {}
    },
    '/org/bluez/hci0': {
        'org.bluez.Adapter1': {
            'Address': '5C:F3:70:9A:F2:65',
            'AddressType': 'public',
            'Alias': 'hyperx',
            'Class': 786696,
            'Discoverable': false,
            'DiscoverableTimeout': 180,
            'Discovering': false,
            'Modalias': 'usb:v1D6Bp0246d0535',
            'Name': 'hyperx',
            'Pairable': false,
            'PairableTimeout': 0,
            'Powered': true,
            'UUIDs': ['0000110e-0000-1000-8000-00805f9b34fb',
                        '0000110a-0000-1000-8000-00805f9b34fb',
                        '00001200-0000-1000-8000-00805f9b34fb',
                        '00001112-0000-1000-8000-00805f9b34fb',
                        '0000110b-0000-1000-8000-00805f9b34fb',
                        '0000110c-0000-1000-8000-00805f9b34fb',
                        '00001800-0000-1000-8000-00805f9b34fb',
                        '00001108-0000-1000-8000-00805f9b34fb',
                        '00001801-0000-1000-8000-00805f9b34fb']
        },
        'org.bluez.GattManager1': {},
        'org.bluez.LEAdvertisingManager1': {
            'ActiveInstances': 0,
            'SupportedIncludes': ['tx-power',
                                'appearance',
                                'local-name'],
            'SupportedInstances': 5
        },
        'org.bluez.Media1': {},
        'org.bluez.NetworkServer1': {},
        'org.freedesktop.DBus.Introspectable': {},
        'org.freedesktop.DBus.Properties': {}
    }
}