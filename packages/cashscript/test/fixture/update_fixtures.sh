#! /usr/bin/env sh

DIR=$(dirname "$0")
cd $DIR

CASHC="../../../cashc/dist/cashc-cli.js"

find . -maxdepth 1 -name "*.cash" | while read fn; do
    echo node "$CASHC" "$fn" -o "$(basename "$fn" .cash).json"
    node "$CASHC" "$fn" -o "$(basename "$fn" .cash).json"
    echo node "$CASHC" "$fn" -o "$(basename "$fn" .cash).artifact.ts" -f ts
    node "$CASHC" "$fn" -o "$(basename "$fn" .cash).artifact.ts" -f ts
done
