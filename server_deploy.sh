#!/bin/sh
set -e

APP_NAME=openlife_web_container

echo "Deploying application ..."

    # Update codebase
    git config --global --add safe.directory /var/www/openlife-web-containerized
    git pull https://stevedane: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@github.com/karbura-team/acamvie-openlife-platform-web.git production

    # Building image
    docker-compose down
    docker-compose build

    # Start container
    docker-compose up -d

echo "Application deployed!"
