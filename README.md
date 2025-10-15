PACE Plate (Food Calorie Calculator)
A lightweight, static web app to search foods, add portions, and see calories, macros, and P.A.C.E. portions (P20, C20, F10). Works locally or via GitHub Pages. No backend required.
Project structure

index.html
styles.css
app.js
foods.csv
README.md

Features

Search foods from a CSV (client-side)
Add items to a meal and edit grams inline
Live totals for kcal, protein, carbs, fat
P.A.C.E. portions summary: P20 = protein/20, C20 = carbs/20, F10 = fat/10
Adjustable daily macro targets with progress bars
Export current meal to CSV

Data model
All nutrition values are per 100 g.
CSV header (must match exactly):
ID,Food Name,Category,kcal_100g,protein_g_100g,carbs_g_100g,fat_g_100g,fiber_g_100g,sugars_g_100g,sodium_mg_100g
Sample foods are provided in foods.csv. You can add more rows later; keep the same columns.
Calculations
Given grams:

factor = grams / 100
kcal = round(kcal_100g * factor)
protein_g = round(protein_g_100g * factor, 1)
carbs_g = round(carbs_g_100g * factor, 1)
fat_g = round(fat_g_100g * factor, 1)
P20 = round(protein_g / 20, 2)
C20 = round(carbs_g / 20, 2)
F10 = round(fat_g / 10, 2)
