import * as DBus from 'dbus-next';

/*
 * Generated by dbus-next interface generator
 * Template: typescript-dts.ts.hbs
 */

/**
 * Service: org.bluez
 * ObjectPath: /org/bluez/hci0
 * Interface: org.freedesktop.DBus.Introspectable
 */
export interface OrgfreedesktopDBusIntrospectable extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'Introspect', inSignature: '', outSignature: 's' })
    Introspect(): Promise<string>;


    /***** Signals *****/

}

/**
 * Service: org.bluez
 * ObjectPath: /org/bluez/hci0
 * Interface: org.bluez.Adapter1
 */
export interface Adapter1 extends DBus.ClientInterface {

    /***** Properties *****/

    //@property({ name: 'Address', signature: 's', access: ACCESS_READ })
    Address(): Promise<string>;

    //@property({ name: 'AddressType', signature: 's', access: ACCESS_READ })
    AddressType(): Promise<string>;

    //@property({ name: 'Name', signature: 's', access: ACCESS_READ })
    Name(): Promise<string>;

    //@property({ name: 'Alias', signature: 's', access: ACCESS_READWRITE })
    Alias(): Promise<string>;
    Alias(value: string): Promise<void>;

    //@property({ name: 'Class', signature: 'u', access: ACCESS_READ })
    Class(): Promise<number>;

    //@property({ name: 'Powered', signature: 'b', access: ACCESS_READWRITE })
    Powered(): Promise<boolean>;
    Powered(value: boolean): Promise<void>;

    //@property({ name: 'Discoverable', signature: 'b', access: ACCESS_READWRITE })
    Discoverable(): Promise<boolean>;
    Discoverable(value: boolean): Promise<void>;

    //@property({ name: 'DiscoverableTimeout', signature: 'u', access: ACCESS_READWRITE })
    DiscoverableTimeout(): Promise<number>;
    DiscoverableTimeout(value: number): Promise<void>;

    //@property({ name: 'Pairable', signature: 'b', access: ACCESS_READWRITE })
    Pairable(): Promise<boolean>;
    Pairable(value: boolean): Promise<void>;

    //@property({ name: 'PairableTimeout', signature: 'u', access: ACCESS_READWRITE })
    PairableTimeout(): Promise<number>;
    PairableTimeout(value: number): Promise<void>;

    //@property({ name: 'Discovering', signature: 'b', access: ACCESS_READ })
    Discovering(): Promise<boolean>;

    //@property({ name: 'UUIDs', signature: 'as', access: ACCESS_READ })
    UUIDs(): Promise<Array<string>>;

    //@property({ name: 'Modalias', signature: 's', access: ACCESS_READ })
    Modalias(): Promise<string>;


    /***** Methods *****/

    //@method({ name: 'StartDiscovery', inSignature: '', outSignature: '' })
    StartDiscovery(): Promise<void>;

    //@method({ name: 'SetDiscoveryFilter', inSignature: 'a{sv}', outSignature: '' })
    SetDiscoveryFilter(properties: {[key: string]: DBus.Variant}): Promise<void>;

    //@method({ name: 'StopDiscovery', inSignature: '', outSignature: '' })
    StopDiscovery(): Promise<void>;

    //@method({ name: 'RemoveDevice', inSignature: 'o', outSignature: '' })
    RemoveDevice(device: DBus.ObjectPath): Promise<void>;

    //@method({ name: 'GetDiscoveryFilters', inSignature: '', outSignature: 'as' })
    GetDiscoveryFilters(): Promise<Array<string>>;


    /***** Signals *****/

}

/**
 * Service: org.bluez
 * ObjectPath: /org/bluez/hci0
 * Interface: org.freedesktop.DBus.Properties
 */
export interface OrgfreedesktopDBusProperties extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'Get', inSignature: 'ss', outSignature: 'v' })
    Get(iface: string, name: string, ): Promise<DBus.Variant>;

    //@method({ name: 'Set', inSignature: 'ssv', outSignature: '' })
    Set(iface: string, name: string, value: DBus.Variant): Promise<void>;

    //@method({ name: 'GetAll', inSignature: 's', outSignature: 'a{sv}' })
    GetAll(iface: string, ): Promise<{[key: string]: DBus.Variant}>;


    /***** Signals *****/

    //@signal({ name: 'PropertiesChanged', signature: 'sa{sv}as' })
    on(evt: "PropertiesChanged", cb: (iface: string, changed_properties: {[key: string]: DBus.Variant}, invalidated_properties: Array<string>) => void): this;
}

/**
 * Service: org.bluez
 * ObjectPath: /org/bluez/hci0
 * Interface: org.bluez.GattManager1
 */
export interface GattManager1 extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'RegisterApplication', inSignature: 'oa{sv}', outSignature: '' })
    RegisterApplication(application: DBus.ObjectPath, options: {[key: string]: DBus.Variant}): Promise<void>;

    //@method({ name: 'UnregisterApplication', inSignature: 'o', outSignature: '' })
    UnregisterApplication(application: DBus.ObjectPath): Promise<void>;


    /***** Signals *****/

}

/**
 * Service: org.bluez
 * ObjectPath: /org/bluez/hci0
 * Interface: org.bluez.LEAdvertisingManager1
 */
export interface LEAdvertisingManager1 extends DBus.ClientInterface {

    /***** Properties *****/

    //@property({ name: 'ActiveInstances', signature: 'y', access: ACCESS_READ })
    ActiveInstances(): Promise<number>;

    //@property({ name: 'SupportedInstances', signature: 'y', access: ACCESS_READ })
    SupportedInstances(): Promise<number>;

    //@property({ name: 'SupportedIncludes', signature: 'as', access: ACCESS_READ })
    SupportedIncludes(): Promise<Array<string>>;

    //@property({ name: 'SupportedSecondaryChannels', signature: 'as', access: ACCESS_READ })
    SupportedSecondaryChannels(): Promise<Array<string>>;


    /***** Methods *****/

    //@method({ name: 'RegisterAdvertisement', inSignature: 'oa{sv}', outSignature: '' })
    RegisterAdvertisement(advertisement: DBus.ObjectPath, options: {[key: string]: DBus.Variant}): Promise<void>;

    //@method({ name: 'UnregisterAdvertisement', inSignature: 'o', outSignature: '' })
    UnregisterAdvertisement(service: DBus.ObjectPath): Promise<void>;


    /***** Signals *****/

}

/**
 * Service: org.bluez
 * ObjectPath: /org/bluez/hci0
 * Interface: org.bluez.Media1
 */
export interface Media1 extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'RegisterEndpoint', inSignature: 'oa{sv}', outSignature: '' })
    RegisterEndpoint(endpoint: DBus.ObjectPath, properties: {[key: string]: DBus.Variant}): Promise<void>;

    //@method({ name: 'UnregisterEndpoint', inSignature: 'o', outSignature: '' })
    UnregisterEndpoint(endpoint: DBus.ObjectPath): Promise<void>;

    //@method({ name: 'RegisterPlayer', inSignature: 'oa{sv}', outSignature: '' })
    RegisterPlayer(player: DBus.ObjectPath, properties: {[key: string]: DBus.Variant}): Promise<void>;

    //@method({ name: 'UnregisterPlayer', inSignature: 'o', outSignature: '' })
    UnregisterPlayer(player: DBus.ObjectPath): Promise<void>;

    //@method({ name: 'RegisterApplication', inSignature: 'oa{sv}', outSignature: '' })
    RegisterApplication(application: DBus.ObjectPath, options: {[key: string]: DBus.Variant}): Promise<void>;

    //@method({ name: 'UnregisterApplication', inSignature: 'o', outSignature: '' })
    UnregisterApplication(application: DBus.ObjectPath): Promise<void>;


    /***** Signals *****/

}

/**
 * Service: org.bluez
 * ObjectPath: /org/bluez/hci0
 * Interface: org.bluez.NetworkServer1
 */
export interface NetworkServer1 extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'Register', inSignature: 'ss', outSignature: '' })
    Register(uuid: string, bridge: string): Promise<void>;

    //@method({ name: 'Unregister', inSignature: 's', outSignature: '' })
    Unregister(uuid: string): Promise<void>;


    /***** Signals *****/

}
