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

Run locally
Option A: Double-click index.html

Some browsers block fetching local CSV files from file://. If results don’t appear, run a local server.

Option B: Start a simple local server

Python: python -m http.server 8000
Node (serve): npx serve
Then open http://localhost:8000

Deploy to GitHub Pages

Create a new GitHub repository (public), e.g., pace-plate
Add the project files at the repo root
Commit and push to main
In Settings > Pages:

Source: Deploy from a branch
Branch: main
Folder: /(root)


Wait 1–2 minutes for the site to build
Access at https://.github.io//

Add or edit foods

Edit foods.csv, keeping the header intact
Values must be per 100 g
For large datasets, consider:

Debouncing search in app.js
Using a robust CSV parser like PapaParse



Notes and improvements

Data is not persisted by default; you can add localStorage to save the meal
Possible enhancements:

Favorites and recent items
Food details modal with fiber/sugars/sodium
oz/serving size toggles
Dark theme
Import/Export entire meal logs



License
MIT License. Use and modify freely.