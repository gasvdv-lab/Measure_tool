# v0.8.28 gerichte test

## CAD-1
- AUTO: alle JS-bestanden syntax geldig.
- AUTO: alle lokale ES-module imports bestaan.
- PC: GLB-filepicker en CAD-menu zichtbaar.
- AR-IN/ROOM of AR-OUT: GLB importeren, vizierplaatsing, rotatie ±5°, hoogte ±1 cm, bevestigen, 1:1 afmetingen visueel controleren.
- AR: project opslaan, AR volledig sluiten, opnieuw openen en controleren dat CAD via IndexedDB terugkomt.

## Bekend openstaand
- Project op locatie plaatsen / referentie-capture is nog niet opgelost en blokkeert de CAD-1 test niet.

# v0.8.27.1 gerichte test
1. World Lock: teken lijn/vorm en loop rond.
2. Shape Fill: sluit vorm; fill moet direct zichtbaar zijn.
3. Registreer 2-4 refs, save, sluit tab/AR volledig, open opnieuw.
4. Gebruik vizier voor refs; menu moet weg zijn tijdens mikken.
5. Gekozen 4+ modus mag niet berekenen met minder dan 4 captures.
6. Apply restore; afmetingen moeten exact gelijk blijven.
7. Teken na restore een nieuwe lijn; deze moet correct aansluiten en opslaan.
8. Save/reopen/restore opnieuw; geen cumulatieve verschuiving van brongeometrie.

# v0.8.23 Spatial Restore

Project Space blijft de geometrische waarheid. Bij het openen van een opgeslagen project met referentiepunten start nu automatisch de positieherstel-flow. De gebruiker wijst dezelfde fysieke referenties opnieuw aan; Measure AR berekent daaruit de transformatie van het permanente Project Origin naar de nieuwe WebXR-sessie. 4+ referenties gebruiken best-fit en residualcontrole.

# Measure AR — TESTING

## Huidige verplichte gate — v0.8.21.6 Project Manager Stability
- `AR-IN`: twee projecten opslaan en kruislings openen.
- `AR-IN`: project kopiëren zonder actieve scène te wijzigen.
- `AR-IN`: niet-actief en actief project wissen.
- `AR-IN`: browser/app herstart met last-project en met recovery.
- `AR-IN`: export/import roundtrip.
- World Lock basis is tijdens de huidige praktijktest positief: eenvoudige lijn en samengestelde geometrie blijven op hun fysieke positie.

# TESTING.md — Measure AR

## Testcodes
- **AUTO** — automatische/statische tests per build.
- **PC** — laptop/browser zonder echte AR.
- **AR-IN/A4** — smartphone binnen op A4-testbench.
- **AR-IN/ROOM** — smartphone binnen op meterschaal.
- **AR-OUT** — smartphone buiten voor terrein/GPS/nauwkeurigheid.

## Huidige verplichte gate — v0.8.21.6 Shape Closure + World Lock
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


## v0.8.21.6 — Project Manager UX
- Projectmanager blijft een overlay boven de actieve AR-sessie.
- Openen, Opslaan, Opslaan als, Nieuw, Importeren en Herstel sluiten de manager en keren terug naar AR.
- Wissen, Hernoemen en Kopiëren blijven in Mijn projecten.
- Mijn projecten gebruikt duidelijke kaarten met ACTIEF-status, statistieken, Openen en een compact Meer-menu.
- Zichtbare toast-feedback voor opslaan/openen/kopiëren/hernoemen/wissen.
- Permanente projectstatus in de AR-topbalk: opgeslagen of gewijzigd.
- Startscherm wordt niet gebruikt als bestemming van Project Manager-acties.

## v0.8.21.8 — Relocalisatie toegang
AR-IN/ROOM: open een opgeslagen project en controleer dat `☰ → Relocalisatie` rechtstreeks beschikbaar is. Voer daarna de referentiepunt-flow uit.

### v0.8.22 hotfix test
AR-IN: Start AR → Project → Nieuw leeg project → bevestigen. Verwacht: Project Manager sluit en camera blijft actief; startscherm verschijnt niet.

## v0.8.24 World Lock 2.0 gate
AR-IN/ROOM: place A→B on a stable surface, confirm both endpoints, then move the phone 0.5–2 m. The committed geometry must remain fixed relative to the environment. If it moves with the phone, stop further Spatial Restore testing.


## v0.8.26 — gerichte fysieke test
1. Sla bij Project de **Hybride locatie** op. Controleer GPS-nauwkeurigheid en eventueel richting.
2. Sluit de AR-sessie volledig en start opnieuw op dezelfde locatie.
3. Open het project en kies **Hybride locatie controleren**. De afstand moet logisch zijn en de GPS-onzekerheid zichtbaar.
4. Kies een opgeslagen referentie en druk **Gebruik vizier**. Het menu moet sluiten.
5. Richt het vizier op het fysieke punt en druk de witte knop. Het relocalisatiescherm moet terugkomen met een vinkje.
6. Herhaal minstens twee referenties en bereken/apply de uitlijning.
7. Controleer dat bestaande geometrie na toepassing world-locked blijft en afmetingen niet veranderen.

## Extra regressies v0.8.27.1
1. Project op locatie plaatsen → Gebruik vizier: witte knop moet actief worden zodra een geldige hit aanwezig is.
2. Open project B nadat project A uitgelijnd is: B mag geen transform/positie van A erven.
3. Wissel meerdere keren van project: geen oude anchors of plotselinge terug-sprongen.
4. Wijzig lijnkleur/dikte na relocalisatie: lijn blijft op dezelfde zichtbare positie.
