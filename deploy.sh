#!/bin/bash

scp -i fse.pem -o StrictHostKeyChecking=no -r src/backend ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:
scp -i fse.pem -o StrictHostKeyChecking=no -r src/frontend ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:
scp -i fse.pem -o StrictHostKeyChecking=no src/package.json ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:
scp -i fse.pem -o StrictHostKeyChecking=no src/package-lock.json ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:
scp -i fse.pem -o StrictHostKeyChecking=no src/server.js ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:
scp -i fse.pem -o StrictHostKeyChecking=no install.sh ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com:

ssh -i fse.pem -o "StrictHostKeyChecking=no" ubuntu@ec2-34-215-131-174.us-west-2.compute.amazonaws.com "./install.sh"
