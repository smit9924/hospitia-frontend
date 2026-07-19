#!/usr/bin/env bash

set -Eeuo pipefail

main_client_dir="clients/main"

###############################################################################
# Validate required files
###############################################################################

required_files=(
    ${main_client_dir}/package.json
    ${main_client_dir}/package-lock.json
    ${main_client_dir}/angular.json
    ${main_client_dir}/jenkins/Dockerfile
    ${main_client_dir}/jenkins/nginx.conf
    ${main_client_dir}/jenkins/.dockerignore
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
    ${main_client_dir}/src
)

for directory in "${required_directories[@]}"; do
    if [[ ! -d "${directory}" ]]; then
        printf 'Required directory not found: %s\n' "${directory}" >&2
        exit 1
    fi
done

printf 'Repository structure validation successful.\n'