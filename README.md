# Measure AR v0.8.1 — Walls on Modular Core

## Nieuw
- aparte module `js/walls.js`
- vanuit Objecten > Lijn: **Maak muur van lijn**
- unieke muurnaam binnen de sessie
- hoogte
- dikte
- links / rechts / gecentreerd op de basislijn
- oriëntatie: verticaal, loodrecht 90°, eigen hoek
- kleur
- transparantie
- Objecten bevat nu categorie **Muren**
- muur zichtbaar/verbergen
- muur verwijderen zonder basislijn te verwijderen
- lijn kan niet stilzwijgend gewist worden zolang een muur ervan afhangt
- undo voor nieuw aangemaakte muur
- Alles wissen wist ook muren en blijft in AR

## Structuur
- index.html
- css/app.css
- js/app.js
- js/ar.js
- js/constraints.js
- js/drawing.js
- js/geometry.js
- js/state.js
- js/ui.js
- js/walls.js

## Nog niet
Openingen/deuren/ramen komen in v0.8.2.
Het bekende label-oriëntatieprobleem blijft apart geparkeerd.

## Upload naar GitHub
Upload de volledige mapstructuur. Niet alleen `index.html`.
