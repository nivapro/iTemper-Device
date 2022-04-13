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

# /org/freedesktop/NetworkManager/Settings/1 interfaces
objectPath=/org/freedesktop/NetworkManager/Settings/1
./bin/generate-client-interfaces.js --system -t $class --full -o $networkmanagerDir/$dest.settings.connection-class.ts $dest $objectPath 
./bin/generate-client-interfaces.js --system -t $dts --full -o $networkmanagerDir/$dest.settings.connection-dts.ts $dest $objectPath
