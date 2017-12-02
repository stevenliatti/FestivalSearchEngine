#!/bin/bash

pkill -f node
npm install
rm -rf doc
mv fse.log fse_old.log
apidoc -e node_modules
npm start &
