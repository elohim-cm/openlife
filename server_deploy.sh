#!/bin/sh
set -e

APP_NAME=openlife_web_container

echo "Deploying application ..."

    # Update codebase
    git config --global --add safe.directory /var/www/openlife-web-containerized
    git pull https://stevedane:${OPENLIFE_DEPLOY}@github.com/karbura-team/acamvie-openlife-platform-web.git production

    # Building image
    docker-compose down
    docker-compose build

    # Start container
    docker-compose up -d

echo "Application deployed!"
