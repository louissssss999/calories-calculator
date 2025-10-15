# P.A.C.E. Calories Calculator

A professional, lightweight, static web app for P.A.C.E. to search foods, add portions to different meal categories (Breakfast, Lunch, Dinner, Snacks), and track calories, macros, and P.A.C.E. portions (PRO, CHO, FAT). Compare against daily targets, including calories. Works locally or via GitHub Pages. No backend required.

## Project structure
- index.html
- styles.css
- app.js
- foods.csv
- README.md
- smaller logo P.A.C.E..jpg (logo image)

## Features
- Search foods from a CSV (client-side)
- Add items to categorized meals (Breakfast, Lunch, Dinner, Snacks) with inline gram editing
- Collapsible meal categories with per-category totals
- Live overall totals for kcal, protein, carbs, fat
- P.A.C.E. portions summary: PRO = protein/20, CHO = carbs/20, FAT = fat/10
- Adjustable daily macro and calorie targets with progress bars
- Show differences (over/under) from daily targets
- Clear all meals button
- Professional layout with logo in header

## Data model
All nutrition values are per 100 g.

CSV header (must match exactly):
ID,Food Name,Category,kcal_100g,protein_g_100g,carbs_g_100g,fat_g_100g,fiber_g_100g,sugars_g_100g,sodium_mg_100g

Sample foods are provided in foods.csv. You can add more rows later; keep the same columns.

## Calculations
Given grams:
factor = grams / 100
kcal = round(kcal_100g * factor)
protein_g = round(protein_g_100g * factor, 1)
carbs_g = round(carbs_g_100g * factor, 1)
fat_g = round(fat_g_100g * factor, 1)
PRO = round(protein_g / 20, 2)
CHO = round(carbs_g / 20, 2)
FAT = round(fat_g / 10, 2)
