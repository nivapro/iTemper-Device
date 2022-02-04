import dbus from 'dbus-next';
import {  Service, ServiceProperties } from './gatt-service';

export interface GATTApplication1 {
    addService(service: Service): void;
    getServices(): Service[];
    publish(): void;
}

type DbusMembers = {
    properties?: { [key: string]: dbus.interface.PropertyOptions},
    methods?: { [key: string]: dbus.interface.MethodOptions },
    signals?: { [key: string]: dbus.interface.SignalOptions }
};

// GetManagedObjects
// out-signature: a{oa{sa{sv}}}


export interface ManagedDescriptors {
    [path: string]: dbus.Variant;
}
export interface CharacteristicProperties {

}
export interface ManagedCharacteristics {
    [path: string]: CharacteristicProperties;
}

export interface ManagedServices {
    [path: dbus.ObjectPath]: ServiceProperties;
}

// org.bluez.GattApplication1 interface implementation
export class Application implements GATTApplication1 {
    _services: Service[] = [];
    _iface: dbus.interface.Interface;



    constructor(private path: string,
                private bus: dbus.MessageBus = dbus.systemBus() ) {
    }
    // Properties & Methods of the GATTApplication interface, use org.freedesktop.DBus.Properties to Get and GetAll
    private GetManagedObjects() {
        const _ManagedObjects: ManagedServices = {};

        this._services.map((service: Service) => {
            _ManagedObjects[service.getPath()] = service.getProperties();
            service.getCharacteristics().map((char) => {
                _ManagedObjects[service.getPath()] = char.getProperties();
            })

            });
        });


        for service in this_services:
        response[service.get_path()] = service.get_properties()
        chrcs = service.get_characteristics()
        for chrc in chrcs:
            response[chrc.get_path()] = chrc.get_properties()
            descs = chrc.get_descriptors()
            for desc in descs:
                response[desc.get_path()] = desc.get_properties()

        return response;

    }



    // Methods for adding characteristics and publishing the interface on DBus.
    public addService(service: Service): void {
        this._services.push(service);
    }
    public getServices(): Service[] {
        return this._services;
    }
    public publish(): void {
        const DBUS_OM_IFACE = 'org.freedesktop.DBus.ObjectManager';
        this._iface = new dbus.interface.Interface(DBUS_OM_IFACE);
        const members: DbusMembers  = {
            methods: {
                GetManagedObjects: {
                    inSignature: '',
                    outSignature: 'a{oa{sa{sv}}}',
                },
            },
        };
        dbus.interface.Interface.configureMembers(members);
        this.bus.export(this.path, this._iface);
    }
}
