#!/bin/bash
cd "$(dirname "$0")/.."

echo "JOBLUX Content Seeding Sprint"
echo "================================="
echo ""

echo "Part 1: WikiLux Brands (this takes ~15 minutes)..."
npx tsx scripts/seed-wikilux.ts
echo ""

echo "Part 2: BlogLux Articles..."
npx tsx scripts/seed-bloglux.ts
echo ""

echo "Part 3: Salary Benchmarks..."
npx tsx scripts/seed-salaries.ts
echo ""

echo "Part 4: Interview Experiences..."
npx tsx scripts/seed-interviews.ts
echo ""

echo "ALL DONE! Check luxuryrecruiter.com to see your content live."
