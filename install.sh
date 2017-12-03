#!/bin/bash

tar xvzf fse.tar.gz fse
cd fse
pkill -f node
npm install
rm -rf doc
mv fse.log fse_old.log
apidoc -e node_modules
mongo fse --eval "db.dropDatabase()"
npm start &
