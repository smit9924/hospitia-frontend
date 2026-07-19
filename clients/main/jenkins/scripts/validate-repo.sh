#!/usr/bin/env bash

set -Eeuo pipefail

###############################################################################
# Validate required files
###############################################################################

required_files=(
    package.json
    package-lock.json
    angular.json
    jenkins/Dockerfile
    jenkins/nginx.conf
    jenkins/.dockerignore
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
    src
)

for directory in "${required_directories[@]}"; do
    if [[ ! -d "${directory}" ]]; then
        printf 'Required directory not found: %s\n' "${directory}" >&2
        exit 1
    fi
done

printf 'Repository structure validation successful.\n'