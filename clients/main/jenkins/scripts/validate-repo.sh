#!/usr/bin/env bash

set -Eeuo pipefail

main-client-dir="clients/main"

###############################################################################
# Validate required files
###############################################################################

required_files=(
    ${main-client-dir}/package.json
    ${main-client-dir}/package-lock.json
    ${main-client-dir}/angular.json
    ${main-client-dir}/jenkins/Dockerfile
    ${main-client-dir}/jenkins/nginx.conf
    ${main-client-dir}/jenkins/.dockerignore
)

for file in "${required_files[@]}"; do
    if [[ ! -f "${file}" ]]; then
        printf 'Required file not found: %s\n' "${file}" >&2
        exit 1
    fi
done

###############################################################################
# Validate required directories
###############################################################################

required_directories=(
    ${main-client-dir}/src
)

for directory in "${required_directories[@]}"; do
    if [[ ! -d "${directory}" ]]; then
        printf 'Required directory not found: %s\n' "${directory}" >&2
        exit 1
    fi
done

printf 'Repository structure validation successful.\n'