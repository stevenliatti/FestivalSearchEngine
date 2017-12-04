#!/bin/bash

mkdir -p fse
cp -r rest/routes rest/utilities rest/package.json rest/package-lock.json rest/server.js fse
tar cvzf fse.tar.gz fse
tar cvzf web.tar.gz web

scp -i fse.pem -o StrictHostKeyChecking=no fse.tar.gz ubuntu@eracnos.ch:
scp -i fse.pem -o StrictHostKeyChecking=no web.tar.gz ubuntu@eracnos.ch:
scp -i fse.pem -o StrictHostKeyChecking=no install.sh ubuntu@eracnos.ch:
rm -rf fse fse.tar.gz
rm -rf web.tar.gz

ssh -i fse.pem -o "StrictHostKeyChecking=no" ubuntu@eracnos.ch "./install.sh"
