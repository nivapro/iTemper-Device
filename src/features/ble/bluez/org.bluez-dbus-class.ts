import * as DBus from 'dbus-next';
import { EventEmitter } from 'events';

/*
 * Generated by dbus-next interface generator
 * Template: typescript-class.ts.hbs
 */

// Introspection XML of org.bluez at /
const XMLObjectData = `<!DOCTYPE node PUBLIC "-//freedesktop//DTD D-BUS Object Introspection 1.0//EN"
"http://www.freedesktop.org/standards/dbus/1.0/introspect.dtd">
<node><interface name="org.freedesktop.DBus.Introspectable"><method name="Introspect"><arg name="xml" type="s" direction="out"/>
</method></interface><interface name="org.freedesktop.DBus.ObjectManager"><method name="GetManagedObjects"><arg name="objects" type="a{oa{sa{sv}}}" direction="out"/>
</method><signal name="InterfacesAdded"><arg name="object" type="o"/>
<arg name="interfaces" type="a{sa{sv}}"/>
</signal>
<signal name="InterfacesRemoved"><arg name="object" type="o"/>
<arg name="interfaces" type="as"/>
</signal>
</interface><node name="org"/></node>`;

/**
 * Service: org.bluez
 * ObjectPath: /
 * Interface: org.freedesktop.DBus.Introspectable
 */
export class OrgfreedesktopDBusIntrospectable extends EventEmitter {

    public readonly dbusInterfaceName = 'org.freedesktop.DBus.Introspectable';
    public dbusObject: DBus.ProxyObject;
    public propertiesDBusInterface: DBus.ClientInterface;
    public thisDBusInterface: DBus.ClientInterface;

    public static Connect(bus: DBus.MessageBus, objectPath: string = "/", xml: string = XMLObjectData): Promise<OrgfreedesktopDBusIntrospectable> {
        return bus.getProxyObject('org.bluez', objectPath, xml).then((obj) => new OrgfreedesktopDBusIntrospectable(obj));
    }

    constructor(dbusObject: DBus.ProxyObject) {
        super();
        this.dbusObject = dbusObject;
        this.thisDBusInterface = this.dbusObject.getInterface('org.freedesktop.DBus.Introspectable');
        this.propertiesDBusInterface = this.dbusObject.getInterface('org.freedesktop.DBus.Properties');

        // forward property change events
        const forwardPropertyChange = (iface: string, changed: any, invalidated: any) => {
            if(iface === this.dbusInterfaceName) {
                this.emit('PropertiesChanged', iface, changed, invalidated);
            }
        }

        // forward all signals
        this.on("newListener", (event: string, listener: (...args: any[]) => void) => {
            if(event === "PropertiesChanged" && this.listenerCount('PropertiesChanged') === 0) {
                this.propertiesDBusInterface.on('PropertiesChanged', forwardPropertyChange);
            } else {
                this.thisDBusInterface.on(event, listener);
            }
        });
        this.on("removeListener", (event: string, listener: (...args: any[]) => void) => {
            if(event === "PropertiesChanged" && this.listenerCount('PropertiesChanged') === 0) {
                this.propertiesDBusInterface.removeListener('PropertiesChanged', forwardPropertyChange);
            } else {
                this.thisDBusInterface.removeListener(event, listener);
            }
        });
    }

    /***** Properties *****/

    public getProperties(): Promise<{[name: string]: DBus.Variant}> {
        return this.propertiesDBusInterface.GetAll(this.dbusInterfaceName);
    }

    public getProperty(name: string): Promise<DBus.Variant> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, name);
    }

    public setProperty(name: string, value: DBus.Variant): Promise<void> {
        return this.propertiesDBusInterface.Set(this.dbusInterfaceName, name, value);
    }


    /***** Methods *****/

    //@method({ name: 'Introspect', inSignature: '', outSignature: 's' })
    public Introspect(): Promise<string> {
        return this.thisDBusInterface.Introspect();
    }

}


/**
 * Service: org.bluez
 * ObjectPath: /
 * Interface: org.freedesktop.DBus.ObjectManager
 */
export class OrgfreedesktopDBusObjectManager extends EventEmitter {

    public readonly dbusInterfaceName = 'org.freedesktop.DBus.ObjectManager';
    public dbusObject: DBus.ProxyObject;
    public propertiesDBusInterface: DBus.ClientInterface;
    public thisDBusInterface: DBus.ClientInterface;

    public static Connect(bus: DBus.MessageBus, objectPath: string = "/", xml: string = XMLObjectData): Promise<OrgfreedesktopDBusObjectManager> {
        return bus.getProxyObject('org.bluez', objectPath, xml).then((obj) => new OrgfreedesktopDBusObjectManager(obj));
    }

    constructor(dbusObject: DBus.ProxyObject) {
        super();
        this.dbusObject = dbusObject;
        this.thisDBusInterface = this.dbusObject.getInterface('org.freedesktop.DBus.ObjectManager');
        this.propertiesDBusInterface = this.dbusObject.getInterface('org.freedesktop.DBus.Properties');

        // forward property change events
        const forwardPropertyChange = (iface: string, changed: any, invalidated: any) => {
            if(iface === this.dbusInterfaceName) {
                this.emit('PropertiesChanged', iface, changed, invalidated);
            }
        }

        // forward all signals
        this.on("newListener", (event: string, listener: (...args: any[]) => void) => {
            if(event === "PropertiesChanged" && this.listenerCount('PropertiesChanged') === 0) {
                this.propertiesDBusInterface.on('PropertiesChanged', forwardPropertyChange);
            } else {
                this.thisDBusInterface.on(event, listener);
            }
        });
        this.on("removeListener", (event: string, listener: (...args: any[]) => void) => {
            if(event === "PropertiesChanged" && this.listenerCount('PropertiesChanged') === 0) {
                this.propertiesDBusInterface.removeListener('PropertiesChanged', forwardPropertyChange);
            } else {
                this.thisDBusInterface.removeListener(event, listener);
            }
        });
    }

    /***** Properties *****/

    public getProperties(): Promise<{[name: string]: DBus.Variant}> {
        return this.propertiesDBusInterface.GetAll(this.dbusInterfaceName);
    }

    public getProperty(name: string): Promise<DBus.Variant> {
        return this.propertiesDBusInterface.Get(this.dbusInterfaceName, name);
    }

    public setProperty(name: string, value: DBus.Variant): Promise<void> {
        return this.propertiesDBusInterface.Set(this.dbusInterfaceName, name, value);
    }


    /***** Methods *****/

    //@method({ name: 'GetManagedObjects', inSignature: '', outSignature: 'a{oa{sa{sv}}}' })
    public GetManagedObjects(): Promise</* a{oa{sa{sv}}} */ {[key:string]: any}> {
        return this.thisDBusInterface.GetManagedObjects();
    }

}
/***** Signals for org.freedesktop.DBus.ObjectManager *****/
export declare interface OrgfreedesktopDBusObjectManager {
    //@signal({ name: 'InterfacesAdded', signature: 'oa{sa{sv}}' })
    on(evt: "InterfacesAdded", cb: (object: DBus.ObjectPath, interfaces: /* a{sa{sv}} */ {[key:string]: any}) => void): this;
    //@signal({ name: 'InterfacesRemoved', signature: 'oas' })
    on(evt: "InterfacesRemoved", cb: (object: DBus.ObjectPath, interfaces: Array<string>) => void): this;
    
    on(event: string, listener: Function): this;
}
