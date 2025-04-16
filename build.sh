#!/usr/bin/env bash

set -efuo pipefail

docker run --mount type=bind,source=./,destination=/app --rm "$(docker build -q .)" bash -c "yarn && yarn build && cd dist && /usr/local/rbenv-root/shims/zat package"
