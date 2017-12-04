#!/bin/bash

mkdir -p fse
cp -r src/backend src/frontend src/package.json src/package-lock.json src/server.js fse
tar cvzf fse.tar.gz fse

scp -i fse.pem -o StrictHostKeyChecking=no fse.tar.gz ubuntu@eracnos.ch:
scp -i fse.pem -o StrictHostKeyChecking=no install.sh ubuntu@eracnos.ch:
rm -rf fse fse.tar.gz

ssh -i fse.pem -o "StrictHostKeyChecking=no" ubuntu@eracnos.ch "./install.sh"
