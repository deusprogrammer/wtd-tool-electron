#!/bin/sh
npm run build
rm -rf ./node_modules/typescript
rm -rf electron/config.json
npx electron-packager . --overwrite --all --out release
# for file in release/*; do
#     if [ -d "$file" ]; then
#         zip -r $file $file
#     fi
# done