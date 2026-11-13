#!/usr/bin/env bash

set -euo pipefail

TEST_DB="${TEST_DB_NAME:-hievents_test}"

psql -v ON_ERROR_STOP=1 --username "${POSTGRES_USER}" --dbname "${POSTGRES_DB}" <<-EOSQL
    SELECT 'CREATE DATABASE ${TEST_DB} OWNER ${POSTGRES_USER}'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${TEST_DB}')\gexec
EOSQL

echo "Test database '${TEST_DB}' is ready."
