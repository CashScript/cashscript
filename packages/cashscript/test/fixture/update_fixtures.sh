#! /usr/bin/env sh

DIR=$(dirname "$0")
cd $DIR

CASHC="../../../cashc/dist/main/cashc-cli.js"

find . -name "*.cash" | while read fn; do
    echo node "$CASHC" -o "$(basename "$fn" .cash).json" "$fn"
    node "$CASHC" -o "$(basename "$fn" .cash).json" "$fn"
done
