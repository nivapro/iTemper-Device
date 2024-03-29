import * as DBus from 'dbus-next';

/*
 * Generated by dbus-next interface generator
 * Template: typescript-dts.ts.hbs
 */

/**
 * Service: org.bluez
 * ObjectPath: /
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
 * ObjectPath: /
 * Interface: org.freedesktop.DBus.ObjectManager
 */
export interface OrgfreedesktopDBusObjectManager extends DBus.ClientInterface {

    /***** Properties *****/


    /***** Methods *****/

    //@method({ name: 'GetManagedObjects', inSignature: '', outSignature: 'a{oa{sa{sv}}}' })
    GetManagedObjects(): Promise</* a{oa{sa{sv}}} */ {[key:string]: any}>;


    /***** Signals *****/

    //@signal({ name: 'InterfacesAdded', signature: 'oa{sa{sv}}' })
    on(evt: "InterfacesAdded", cb: (object: DBus.ObjectPath, interfaces: /* a{sa{sv}} */ {[key:string]: any}) => void): this;
    //@signal({ name: 'InterfacesRemoved', signature: 'oas' })
    on(evt: "InterfacesRemoved", cb: (object: DBus.ObjectPath, interfaces: Array<string>) => void): this;
}

