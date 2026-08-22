# Measure AR v0.8.0 — Modular Core & Universal Constraints

Deze versie is bewust een architectuurrebuild.

## Waarom
v0.7.5 gaf een `Maximum call stack size exceeded`-fout. De monolithische index.html
was te groot en te gekoppeld geworden. v0.8.0 splitst de app op in modules.

## Bestanden
- index.html — uitsluitend de HTML-structuur
- css/app.css — volledige UI-opmaak
- js/state.js — gedeelde applicatiestatus
- js/ar.js — WebXR, hit-test, renderloop, zoom
- js/constraints.js — universele richting/constraints + snapping
- js/geometry.js — vaste punten, lijnen, labels, contouren, shapes
- js/drawing.js — meten, uitzetten en doorlopend tekenen
- js/ui.js — menu, objectbeheer en eventlisteners
- js/app.js — bootstrap

## Universele richting
Dezelfde constraint-engine wordt gebruikt door:
- Meten
- Nieuwe lijn
- Doorlopend tekenen
- Uitzetten

Modi:
- Vrij
- Horizontaal
- Verticaal
- Op oppervlak
- Parallel aan referentielijn
- Loodrecht 90° op referentielijn
- Eigen hoek t.o.v. referentielijn

Een referentielijn kies je via:
Objecten > Lijn > Gebruik als referentielijn

## Bewust tijdelijk niet in v0.8.0
Muren/openingen uit de experimentele v0.7.5 zijn NIET meegenomen.
Eerst moet deze modulaire core op de telefoon stabiel bewezen zijn.
Daarna bouwen we walls.js/openings.js bovenop deze basis.

## Behouden
- vaste world-space punten
- meten
- uitzetten
- meerdere lijnen
- doorlopend tekenen
- Voltooien sluit laatste punt naar A
- unieke vormnaam
- vormvulling + oppervlakte
- selectief objectbeheer
- Alles wissen zonder AR te verlaten
- zoom
- referentielijnen / snapping

## Bekend
Het eerder gemelde label-oriëntatieprobleem blijft geparkeerd voor een aparte labels-upgrade.

## GitHub upload
Upload de VOLLEDIGE mapstructuur naar de root van de repository:
index.html
css/app.css
js/*.js

Niet alleen index.html uploaden.
