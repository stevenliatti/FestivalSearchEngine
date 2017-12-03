#!/bin/bash

mkdir -p fse
cp -r src/backend src/frontend src/package.json src/package-lock.json src/server.js fse
tar cvzf fse.tar.gz fse

scp -i fse.pem -o StrictHostKeyChecking=no fse.tar.gz ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:
scp -i fse.pem -o StrictHostKeyChecking=no install.sh ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:
rm -rf fse fse.tar.gz

ssh -i fse.pem -o "StrictHostKeyChecking=no" ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com "./install.sh"
