import * as DBus from 'dbus-next';

/*
 * Generated by dbus-next interface generator
 * Template: typescript-dts.ts.hbs
 */

/**
 * Service: org.freedesktop.NetworkManager
 * ObjectPath: /org/freedesktop/NetworkManager/Settings
 * Interface: org.freedesktop.DBus.Properties
 */
export interface OrgfreedesktopDBusProperties extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'Get', inSignature: 'ss', outSignature: 'v' })
    Get(interface_name: string, property_name: string, ): Promise<DBus.Variant>;

    //@method({ name: 'GetAll', inSignature: 's', outSignature: 'a{sv}' })
    GetAll(interface_name: string, ): Promise<{[key: string]: DBus.Variant}>;

    //@method({ name: 'Set', inSignature: 'ssv', outSignature: '' })
    Set(interface_name: string, property_name: string, value: DBus.Variant): Promise<void>;


    /***** Signals *****/

    //@signal({ name: 'PropertiesChanged', signature: 'sa{sv}as' })
    on(evt: "PropertiesChanged", cb: (interface_name: string, changed_properties: {[key: string]: DBus.Variant}, invalidated_properties: Array<string>) => void): this;
}

/**
 * Service: org.freedesktop.NetworkManager
 * ObjectPath: /org/freedesktop/NetworkManager/Settings
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
 * Service: org.freedesktop.NetworkManager
 * ObjectPath: /org/freedesktop/NetworkManager/Settings
 * Interface: org.freedesktop.DBus.Peer
 */
export interface OrgfreedesktopDBusPeer extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'Ping', inSignature: '', outSignature: '' })
    Ping(): Promise<void>;

    //@method({ name: 'GetMachineId', inSignature: '', outSignature: 's' })
    GetMachineId(): Promise<string>;


    /***** Signals *****/

}

/**
 * Service: org.freedesktop.NetworkManager
 * ObjectPath: /org/freedesktop/NetworkManager/Settings
 * Interface: org.freedesktop.NetworkManager.Settings
 */
export interface Settings extends DBus.ClientInterface {

    /***** Properties *****/

    //@property({ name: 'Connections', signature: 'ao', access: ACCESS_READ })
    Connections(): Promise<Array<DBus.ObjectPath>>;

    //@property({ name: 'Hostname', signature: 's', access: ACCESS_READ })
    Hostname(): Promise<string>;

    //@property({ name: 'CanModify', signature: 'b', access: ACCESS_READ })
    CanModify(): Promise<boolean>;


    /***** Methods *****/

    //@method({ name: 'ListConnections', inSignature: '', outSignature: 'ao' })
    ListConnections(): Promise<Array<DBus.ObjectPath>>;

    //@method({ name: 'GetConnectionByUuid', inSignature: 's', outSignature: 'o' })
    GetConnectionByUuid(uuid: string, ): Promise<DBus.ObjectPath>;

    //@method({ name: 'AddConnection', inSignature: 'a{sa{sv}}', outSignature: 'o' })
    AddConnection(connection: /* a{sa{sv}} */ {[key:string]: any}, ): Promise<DBus.ObjectPath>;

    //@method({ name: 'AddConnectionUnsaved', inSignature: 'a{sa{sv}}', outSignature: 'o' })
    AddConnectionUnsaved(connection: /* a{sa{sv}} */ {[key:string]: any}, ): Promise<DBus.ObjectPath>;

    //@method({ name: 'AddConnection2', inSignature: 'a{sa{sv}}ua{sv}', outSignature: 'oa{sv}' })
    AddConnection2(settings: /* a{sa{sv}} */ {[key:string]: any}, flags: number, args: {[key: string]: DBus.Variant}, ): Promise<any>;

    //@method({ name: 'LoadConnections', inSignature: 'as', outSignature: 'bas' })
    LoadConnections(filenames: Array<string>, ): Promise<any>;

    //@method({ name: 'ReloadConnections', inSignature: '', outSignature: 'b' })
    ReloadConnections(): Promise<boolean>;

    //@method({ name: 'SaveHostname', inSignature: 's', outSignature: '' })
    SaveHostname(hostname: string): Promise<void>;


    /***** Signals *****/

    //@signal({ name: 'PropertiesChanged', signature: 'a{sv}' })
    on(evt: "PropertiesChanged", cb: (properties: {[key: string]: DBus.Variant}) => void): this;
    //@signal({ name: 'NewConnection', signature: 'o' })
    on(evt: "NewConnection", cb: (connection: DBus.ObjectPath) => void): this;
    //@signal({ name: 'ConnectionRemoved', signature: 'o' })
    on(evt: "ConnectionRemoved", cb: (connection: DBus.ObjectPath) => void): this;
}

