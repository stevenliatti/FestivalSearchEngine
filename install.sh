#!/bin/bash

tar xvzf fse.tar.gz fse
tar xvzf web.tar.gz web
sudo cp -r web/* /var/www/html/
cd fse
pkill -f node
npm install
rm -rf doc
mv fse.log fse_old.log
apidoc -e node_modules
# mongo fse --eval "db.dropDatabase()"
npm start &
