#!/bin/sh
# npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate src/databse/migrations/first-migration -d src/database/dataSource.ts
NEW_FILENAME=$(cat /dev/urandom | tr -dc 'a-zA-Z0-9&-@' | fold -w 10 | head -n 1);
MIGRATION_FILE_PATH=src/db/migrations/
DATASOURCE_PATH=src/db/data-source.ts

npx ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:generate "${MIGRATION_FILE_PATH}${NEW_FILENAME}" -d ${DATASOURCE_PATH}