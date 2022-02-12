
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

const applicationGetManagedObjects = {
    "/io/itemper/service0": {
        "org.bluez.GattService1": {
            "UUID":"1ad01b31-dd4b-478c-9aa3-12bd90900000",
            "Primary":true,
            "Characteristics": [
                "/io/itemper/service0/char0",
                "/io/itemper/service0/char1"
            ]
        }
    },
    "/io/itemper/service0/char0": {
        "org.bluez.GattCharacteristic1": {
            "Service":"/io/itemper/service0",
            "UUID":"1ad01b31-dd4b-478c-9aa3-12bd90900001",
            "Flags":["Read"],
            "Descriptors":[]
        }
    },
    "/io/itemper/service0/char1": {
        "org.bluez.GattCharacteristic1": {
            "Service":"/io/itemper/service0",
            "UUID":"1ad01b31-dd4b-478c-9aa3-12bd90900002",
            "Flags":["Read"],
            "Descriptors":[]
        }
    }
}
// ('g-io-error-quark: GDBus.Error:com.github.dbus_next.Error: The DBus library '
//  'encountered an error.\n'
//  'Error: expected a Variant for value (got string)\n'
//  '    at jsToMarshalFmt '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/marshall-compat.js:93:15)\n'
//  '    at jsToMarshalFmt '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/marshall-compat.js:118:27)\n'
//  '    at jsToMarshalFmt '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/marshall-compat.js:118:27)\n'
//  '    at jsToMarshalFmt '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/marshall-compat.js:118:27)\n'
//  '    at marshallMessage '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/marshall-compat.js:179:27)\n'
//  '    at EventEmitter.self.message '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/connection.js:164:27)\n'
//  '    at MessageBus.send '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/bus.js:372:22)\n'
//  '    at sendReply '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/service/handlers.js:332:13)\n'
//  '    at handleMessage '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/service/handlers.js:338:9)\n'
//  '    at handleMessage '
//  '(/home/tova/repos/iTemper-Device/node_modules/dbus-next/lib/bus.js:136:21) '
//  '(36)')