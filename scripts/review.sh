#!/bin/bash

echo "===== git status ====="
git status

echo
echo "===== recent commits ====="
git log --oneline -5

echo
echo "===== package.json ====="
cat package.json

echo
echo "===== TODO / FIXME ====="
grep -r "TODO\|FIXME\|HACK" src/ --include="*.ts" --include="*.tsx" -n

echo
echo "===== docker compose ====="
ls | grep compose

echo
echo "===== env example ====="
ls | grep .env
