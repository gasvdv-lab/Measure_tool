# TESTING.md — Measure AR

## Testcodes
- **AUTO** — automatische/statische tests per build.
- **PC** — laptop/browser zonder echte AR.
- **AR-IN/A4** — smartphone binnen op A4-testbench.
- **AR-IN/ROOM** — smartphone binnen op meterschaal.
- **AR-OUT** — smartphone buiten voor terrein/GPS/nauwkeurigheid.

## Huidige verplichte gate — v0.8.21.4 Shape Closure + World Lock
Voer deze test **eerst** uit. Stop bij een fout en ga niet verder met Relocalization.

1. Start een volledig nieuwe AR-sessie.
2. Controleer de HUD:
   - voorkeur: `World Lock: actief · ... anchors`;
   - noteer expliciet wanneer `World Lock: lokale tracking` verschijnt.
3. Teken A→B en bevestig B.
4. Beweeg daarna de smartphone 0,5–2 m zijwaarts, vooruit/achteruit en draai rond AB.
5. **PASS:** AB blijft gekoppeld aan dezelfde fysieke plaats in de kamer.
6. **FAIL:** AB blijft ongeveer op dezelfde schermpositie of schuift zichtbaar mee met de telefoon/wereld.
7. Herhaal met:
   - Vrij;
   - Horizontaal + exacte afstand;
   - Verticaal + exacte afstand omhoog;
   - Verticaal + exacte afstand omlaag.
8. Maak een muur op een bevestigde lijn en beweeg opnieuw rond het object.
9. Undo → Redo → herhaal de world-lockcontrole.

## Constraint-regressie na World Lock PASS
1. Horizontaal exact: 0,50 / 1,00 / 2,50 m.
2. Verticaal exact: omhoog/omlaag.
3. Verticaal AUTO.
4. Op oppervlak exact/AUTO.
5. Parallel exact/AUTO, beide richtingen.
6. Loodrecht exact/AUTO, links/rechts.
7. Eigen hoek 30°/45°/90° exact/AUTO.
8. Vrij exact/AUTO.
9. Muur maken → Objecten → Muren → wissen.
10. Undo/Redo; objectlijst en scène blijven synchroon.

## Permanente volgorde per upgrade
1. AUTO
2. PC indien relevant
3. AR-IN/A4
4. AR-IN/ROOM wanneer tracking/schaal relevant is
5. AR-OUT alleen wanneer terrein/GPS/buitennauwkeurigheid relevant is

Niet-uitgevoerde fysieke tests blijven open en worden naar volgende versies meegenomen.

## A4-testbench
Een gestandaardiseerd afdrukbaar testblad blijft gepland. Afdrukken op 100% schaal, nooit 'passen aan pagina'.
