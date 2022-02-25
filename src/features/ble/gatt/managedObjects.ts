
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
// From D-feet
const Dfeet = {
    '/io/itemper/service0': {
        'org.bluez.GattService1': {
            'Characteristics': [
                '/io/itemper/service0/char0',
                '/io/itemper/service0/char1'
            ],
            'Primary': true, // True,
            'UUID': '1ad01b31-dd4b-478c-9aa3-12bd90900000'
        }
    },
    '/io/itemper/service0/char0': {
        'org.bluez.GattCharacteristic1': {
            'Descriptors': [],
            'Flags': ['Read'],
            'Service': '/io/itemper/service0',
            'UUID': '1ad01b31-dd4b-478c-9aa3-12bd90900001'
        }
    },
    '/io/itemper/service0/char1': {
        'org.bluez.GattCharacteristic1': {
            'Descriptors': [],
            'Flags': ['Read'],
            'Service': '/io/itemper/service0',
            'UUID': '1ad01b31-dd4b-478c-9aa3-12bd90900002'
        }
    }
}

const members = {
    "properties":{
        "UUID":{"signature":"s","access":"read","name":"UUID","signatureTree":[{"type":"s","child":[]}]},
        "Service":{"signature":"o","access":"read","name":"Service","signatureTree":[{"type":"o","child":[]}]},
        "Flags":{"signature":"as","access":"read","name":"Flags","signatureTree":[{"type":"a","child":[{"type":"s","child":[]}]}]}
    },
    "methods":{
        "ReadValue":{"inSignature":"a{sv}","outSignature":"ay","name":"ReadValue","disabled":false,"inSignatureTree":[{"type":"a","child":[{"type":"{","child":[{"type":"s","child":[]},{"type":"v","child":[]}]}]}],"outSignatureTree":[{"type":"a","child":[{"type":"y","child":[]}]}]},
        "WriteValue":{"inSignature":"aya{sv}","outSignature":"","name":"WriteValue","disabled":false,"inSignatureTree":[{"type":"a","child":[{"type":"y","child":[]}]},{"type":"a","child":[{"type":"{","child":[{"type":"s","child":[]},{"type":"v","child":[]}]}]}],"outSignatureTree":[]}
    }
}
