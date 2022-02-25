#!/bin/bash
source=.

dest=/etc/dbus-1
echo "copies system-local.conf from $source to $dest "
sudo mv -f $dest/system-local.conf   $dest/system-local.orig
sudo cp -f $source/system-local.conf $dest/system-local.conf

dest=$dest/system.d
echo "copies Bluetooth.conf from $source to $dest "
sudo mv -f $dest/bluetooth.conf  $dest/bluetooth.orig
sudo cp -f $source/bluetooth.conf $dest/bluetooth.conf

echo "copies io.itemper.conf from $source to $dest "
sudo mv -f $dest/io.itemper.conf $dest/io.itemper.orig
sudo cp -f $source/io.itemper.conf $dest/io.itemper.conf
