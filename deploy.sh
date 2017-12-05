#!/bin/bash

if [[ $# != 1 ]]; then
    echo "Usage: ./deploy.sh <script>"
    echo "<script> can be 'full_install.sh' or 'soft_install.sh'"
    exit 1
fi

mkdir -p fse/rest
cp -r rest/routes rest/utilities rest/package.json rest/package-lock.json rest/server.js fse/rest
cp -r web fse
cp full_install.sh soft_install.sh fse
tar cvzf fse.tar.gz fse

scp -i fse.pem -o StrictHostKeyChecking=no fse.tar.gz ubuntu@eracnos.ch:
rm -rf fse fse.tar.gz

ssh -i fse.pem -o "StrictHostKeyChecking=no" ubuntu@eracnos.ch "tar xvzf fse.tar.gz fse; cd fse; pwd; ./$1"
