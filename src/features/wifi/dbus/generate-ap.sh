#!/bin/bash
# Generates typescript client interfaces, need a forked dbus-next and a cloned itemper-Device to do this
networkmanagerDir=~/repos/iTemper-Device/src/features/wifi/dbus/generated
xmlFile=~/repos/iTemper-Device/src/features/wifi/dbus/access-point.xml
dbusDir=~/repos/node-dbus-next

# Set working directory
cd $dbusDir

# Typescript templates
dts=./templates/typescript-dts.ts.hbs
class=./templates/typescript-class.ts.hbs

# Network Manager destination name
dest=org.freedesktop.NetworkManager

# Access point interfaces
objectPath=/org/freedesktop/NetworkManager/Devices/AccessPoint
./bin/generate-client-interfaces.js --xml $xmlFile  -t $class --full -o $networkmanagerDir/$dest.ap-class.ts $dest $objectPath 
./bin/generate-client-interfaces.js --xml $xmlFile  -t $dts --full -o $networkmanagerDir/$dest.ap-dts.ts $dest $objectPath 

