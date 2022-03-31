#!/bin/bash
# Generates typescript client interfaces, need a forked dbus-next and a cloned itemper-Device to do this
networkmanagerDir=~/repos/iTemper-Device/src/features/wifi/dbus/generated
dbusDir=~/repos/node-dbus-next

# Set working directory
cd $dbusDir

# Typescript templates
dts=./templates/typescript-dts.ts.hbs
class=./templates/typescript-class.ts.hbs

# Network Manager destination name
dest=org.freedesktop.NetworkManager

# /org/freedesktop/NetworkManager interfaces
objectPath=/org/freedesktop/NetworkManager
./bin/generate-client-interfaces.js --system -t $class --full -o $networkmanagerDir/$dest-class.ts $dest $objectPath 
./bin/generate-client-interfaces.js --system -t $dts  --full -o $networkmanagerDir/$dest-dts.ts $dest $objectPath 

# /org/freedesktop/NetworkManager/Settings interfaces
objectPath=/org/freedesktop/NetworkManager/Settings
./bin/generate-client-interfaces.js --system -t $class --full -o $networkmanagerDir/$dest.settings-class.ts $dest $objectPath 
./bin/generate-client-interfaces.js --system -t $dts --full -o $networkmanagerDir/$dest.settings-dts.ts $dest $objectPath

# /org/freedesktop/NetworkManager/Devices/3 wireless interfaces
objectPath=/org/freedesktop/NetworkManager/Devices/3
./bin/generate-client-interfaces.js --system -t $class --full -o $networkmanagerDir/$dest.wireless-class.ts $dest $objectPath 
./bin/generate-client-interfaces.js --system -t $dts --full -o $networkmanagerDir/$dest.wireless-dts.ts $dest $objectPath 

