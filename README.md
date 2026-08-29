# Measure AR v0.8.28 — CAD Import & Placement

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

## Nieuw in v0.8.28
- CAD / 3D-model menu toegevoegd.
- GLB en self-contained glTF importeren vanuit de browser.
- 1:1 schaal: Measure AR schaalt CAD-modellen niet automatisch.
- Model wordt bij import op het actuele AR-oppervlak geplaatst en volgt het vizier tot bevestiging.
- Plaatsingsregeling: draaien per 5°, hoogte per 1 cm, opnieuw positioneren en bevestigen.
- Modelpositie wordt opgeslagen in Project Space en volgt de actieve Project Transform.
- CAD-bestand wordt lokaal in IndexedDB bewaard zodat een opgeslagen project het model op hetzelfde toestel opnieuw kan laden.
- CAD-metadata wordt mee opgeslagen in het Measure AR project.

## Belangrijk
Voor FreeCAD is de aanbevolen route: exporteer het model eerst als **GLB** en importeer dat bestand in Measure AR. GLB is aanbevolen omdat alle geometrie/materialen in één bestand zitten. Een `.gltf` met externe `.bin`- of texturebestanden kan in deze eerste CAD-versie niet volledig worden hersteld.

De app behandelt glTF-eenheden als meters. Een model van 5.00 × 4.00 m wordt dus als 5.00 × 4.00 m in AR geladen. De gebruiker kan in v0.8.28 niet vrij schalen.

## Bekende openstaande bug
`Project op locatie plaatsen` / referentie-capture blijft openstaand. De witte bevestigingsknop kan in die flow nog onbruikbaar blijven. Deze bug is bewust niet onderdeel van CAD-1 en moet later opnieuw worden aangepakt.

## Eerste CAD-test
1. Start AR en wacht op een groen hit-test vizier.
2. Open ☰ → **CAD / 3D-model**.
3. Kies **CAD-model importeren** en selecteer een GLB.
4. Richt het vizier op de gewenste fysieke positie.
5. Open het CAD-menu opnieuw en regel rotatie/hoogte indien nodig.
6. Kies **Plaats CAD hier**.
7. Loop rondom het model en controleer schaal en positie.
8. Sla het project op, sluit AR volledig, open opnieuw en controleer of het model opnieuw uit IndexedDB wordt geladen.

## Kwaliteitsregels
- Projectgeometrie blijft Project Space.
- CAD-plaatsing wordt in Project Space opgeslagen.
- AR-weergave gebruikt Project Transform zonder bronafmetingen te wijzigen.
- Schaal blijft 1.0.
- Geen losse TEST_RESULTS-bestanden in release-ZIPs.
