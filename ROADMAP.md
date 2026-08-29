# Measure AR Roadmap

**Huidige build: v0.8.21.2 — Constraint Regression Audit**

**Actuele gate:** eerst basis-tekenconstraints fysiek valideren (AR-IN/A4 en AR-IN/ROOM) vóór verdere Relocalization-tests.

# Measure AR — Master Roadmap

**Huidige versie:** v0.8.21.2  
**Status:** bugfix op v0.8.21; Relocalization blijft functioneel maar verdere validatie wacht tot constructieregressie is goedgekeurd.

## Testcodes
AUTO · PC · AR-IN/A4 · AR-IN/ROOM · AR-OUT

## Nu
### v0.8.21.2 — Exacte afstand + Horizontaal bugfix
- [x] Richtingsberekening van exacte horizontale plaatsing corrigeren.
- [x] Preview, opgeslagen punt en ingestelde afstand laten vertrekken van dezelfde kandidaatpositie.
- [x] Cache/build-id verhogen zodat GitHub Pages geen oude modules mengt.
- [x] AUTO-regressietests uitvoeren.
- [ ] AR-IN/A4/ROOM: Horizontaal + exacte afstand fysiek controleren.
- [ ] Andere exacte constraints fysiek regressietesten.

### Testinfrastructuur
- [x] TESTING.md introduceren.
- [ ] Gestandaardiseerde Measure AR A4 Test Sheet maken.
- [ ] v0.8.21 Relocalization op A4 valideren.
- [ ] v0.8.21 Relocalization op kamerniveau valideren.
- [ ] Later AR-OUT-validatie uitvoeren.

## Daarna
1. **v0.8.22 — Relocalization 2.0** — kalibratiewizard, residuals per punt, foutdetectie, kwaliteits-UI.
2. **AR Core Stability** — lifecycle/cleanup/restart, hit-test/range, reticle, lijn- en labelregressies.
3. **Project Coordinate System** — Project Space → Project Transform → AR World Space.
4. **Werkvlakken** — horizontaal, verticaal, vrij/hellend.
5. **Constructie 2.0** — A→B→C→D, exact, constraints, Smart Snap, referenties.
6. **Editing 2.0** — eigenschappen, maat/positie waar logisch, move/copy/rotate.
7. **UI/HUD 2.0** — menu voor keuze/configuratie, compacte AR-HUD.
8. **CAD-1 Import & Visualize** — GLB/glTF, eenheden, 1:1, model-origin, binnen/buiten.
9. **CAD-2 Placement & Relocalization** — 1/2/3/4+ referenties via dezelfde transform-engine.
10. **CAD-3 Inspect** — objectboom, hide/show, isolate, transparantie, ghost/x-ray, wireframe.
11. **v0.9.0 Measure Engine** — afstand, hoogte, 3D/horizontaal/verticaal, hoek, helling, oppervlak, omtrek; reality↔reality, CAD↔CAD, reality↔CAD.
12. **CAD Spatial** — doorsneden, clipping, sightlines, ruimtelijke inspectie.
13. **CAD Design** — varianten, interieur, annotaties, snapshots.
14. **CAD Verify** — ontwerp versus gebouwde werkelijkheid / eenvoudige as-built-controle.
15. **AR-CAD constructietools** — offset, trim, extend, split, move, copy, rotate, mirror; verdere muren/openingen.
16. **Project Explorer** — hiërarchische projectboom en gekoppelde selectie.
17. **2D Plan** — plattegrond en laptopworkflow zonder AR.
18. **Rapportage/export** — PDF, CSV, SVG, GLB; DXF onderzoeken.
19. **Location Projects** — GPS voor projectkeuze, relocalization voor precieze uitlijning.
20. **Advanced AR** — depth/occlusion, betere rendering, later mogelijke VPS/Geospatial browserondersteuning.
21. **Architectuurfuncties** — ooghoogte, zichtlijnen, zon/schaduw.
22. **Andere platformen** — later iOS; veel later VR/XR.
23. **Permanente kwaliteitscyclus** — AUTO + relevante PC/AR-tests, cumulatief in README/TESTING/ROADMAP.

## Permanente open punten
- Definitieve lijnlabel-oriëntatie en collision avoidance.
- Hit-test/range en reticle-feedback verder verbeteren.
- Punten/lijnen visueel verfijnen; zwevende lijnindruk vermijden.
- Objectlijsten alleen contextueel tonen.
- Back/menu-navigatie altijd betrouwbaar houden.
- De functie **Meten** blijft expliciet gepland voor de grote Measure Engine.
