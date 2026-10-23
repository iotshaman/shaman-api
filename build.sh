#!/bin/bash

# FOR USE WITH SHAMAN-CI

# login to github and clone repository
gh-login.sh "$GH_TOKEN"
git-clone.sh --user iotshaman --repo shaman-api --branch master

# build modules
restore-npm.sh /app/shaman-api/library/
npm-audit-fix.sh --path /app/shaman-api/library/
build-npm.sh /app/shaman-api/library/ --skip-install

# stage library
stage-folder.sh --source /app/shaman-api/library/dist --target shaman-api/dist
stage-file.sh --source /app/shaman-api/README.md --target shaman-api/README.md
stage-file.sh --source /app/shaman-api/library/package.json --target shaman-api/package.json
stage-file.sh --source /app/shaman-api/library/public_api.d.ts --target shaman-api/public_api.d.ts
patch-package-json.sh --file /app/staging/shaman-api/package.json --entry dist/index.js --rm-dev

# manual touch-ups to package.json
jq 'del(.scripts, .nyc) | .private = false' /app/staging/shaman-api/package.json > /app/staging/shaman-api/package.tmp
mv /app/staging/shaman-api/package.tmp /app/staging/shaman-api/package.json