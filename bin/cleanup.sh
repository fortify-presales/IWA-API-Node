#!/bin/bash

# Import local environment specific settings
ENV_FILE="${PWD}/.env"
if [ ! -f $ENV_FILE ]; then
    echo "An '.env' file was not found in ${PWD}"
    exit 1
fi
source .env
AppName=$SSC_APP_NAME
ScanSwitches="-Dcom.fortify.sca.ProjectRoot=.fortify"

if [ -z "${AppName}" ]; then
    echo "Application Name has not been set in '.env'"; exit 1
fi

echo Removing files...
sourceanalyzer $ScanSwitches -b "$AppName" -clean
rm -rf .fortify
rm -f "${AppName}.fpr"
rm -f "${AppName}.pdfr"
rm -f "fod.zip"
rm -f "*Package.zip"
rm -rf ".debricked"
rm -rf logs
# rm -rf node_modules
echo Done.
