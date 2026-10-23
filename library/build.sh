#!/bin/bash

# FOR USE WITH SHAMAN-CI

# login to github and clone repository
gh-login.sh "$GH_TOKEN"
git-clone.sh --user iotshaman --repo shaman-api --branch main

# build modules
restore-npm.sh /app/shaman-api/library/
npm-audit-fix.sh --path /app/shaman-api/library/
build-npm.sh /app/shaman-api/library/ --skip-install