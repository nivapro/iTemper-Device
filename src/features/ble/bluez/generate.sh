#!/bin/bash
# Generates typescript client interfaces, need a forked dbus-next and a cloned itemper-Device to do this
bluezDir=~/repos/iTemper-Device/src/features/ble/bluez/generated
dbusDir=~/repos/node-dbus-next

# Set working directory
cd $dbusDir

# Typescript templates
dts=./templates/typescript-dts.ts.hbs
class=./templates/typescript-class.ts.hbs

# Bluez destination name
dest=org.bluez

# org.bluez dbus interfaces, such as ObjectManager
object=/
./bin/generate-client-interfaces.js --system -t $class --full -o $bluezDir/$dest-dbus-class.ts $dest $object 
./bin/generate-client-interfaces.js --system -t $dts  --full -o $bluezDir/$dest-dbus-dts.ts $dest $object 

# org.bluez GAP interfaces
object=/org/bluez
./bin/generate-client-interfaces.js --system -t $class --full -o $bluezDir/$dest-gap-class.ts $dest $object 
./bin/generate-client-interfaces.js --system -t $dts --full -o $bluezDir/$dest-gap-dts.ts $dest $object 

# org.bluez GATT interfaces
object=/org/bluez/hci0
./bin/generate-client-interfaces.js --system -t $class --full -o $bluezDir/$dest-gatt-hci0-class.ts $dest $object 
./bin/generate-client-interfaces.js --system -t $dts --full -o $bluezDir/$dest-gatt-hci0-dts.ts $dest $object

object=/org/bluez/hci1
./bin/generate-client-interfaces.js --system -t $class --full -o $bluezDir/$dest-gatt-hci1-class.ts $dest $object 
./bin/generate-client-interfaces.js --system -t $dts --full -o $bluezDir/$dest-gatt-hci1-dts.ts $dest $object
