#!/bin/bash
cd "$(dirname "$0")/.."
npx tsx scripts/seed-interviews.ts
