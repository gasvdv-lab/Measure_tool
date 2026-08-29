# Measure AR — Master Roadmap

**Huidige versie:** v0.8.21.3 — World Lock Core  
**Huidige gate:** bevestigde AR-geometrie moet fysiek world-locked zijn vóór verdere Relocalization- of featureontwikkeling.

## Testcodes
`AUTO` · `PC` · `AR-IN/A4` · `AR-IN/ROOM` · `AR-OUT`

## Nu — Core herstel
### v0.8.21.3 — World Lock Core
- [x] WebXR Anchors als optionele sessiefeature toevoegen.
- [x] Session-local anchor manager toevoegen.
- [x] Projectpositie en actuele AR-worldpositie scheiden.
- [x] Punten world-locken.
- [x] Definitieve lijnen uit verankerde eindpunten renderen.
- [x] Labels en vormen aan world-lockpositie koppelen.
- [x] Muren resynchroniseren wanneer ankerposes wijzigen.
- [x] Anchor lifecycle bij delete/Undo/Redo/Relocalization koppelen.
- [x] HUD-status tonen: anchors actief versus lokale fallback.
- [x] AUTO-regressiecontrole.
- [ ] **AR-IN/ROOM:** bevestigde A→B blijft op fysieke plaats bij camerabeweging.
- [ ] **AR-IN/ROOM:** Horizontaal/Verticaal/Vrij exact blijven world-locked.
- [ ] **AR-IN/ROOM:** muur blijft world-locked.
- [ ] Daarna pas constraints opnieuw volledig valideren.

### Testinfrastructuur
- [x] `TESTING.md` aanwezig en cumulatief.
- [ ] Gestandaardiseerde Measure AR A4 Test Sheet maken.
- [ ] Na World Lock: v0.8.21 Relocalization op A4 valideren.
- [ ] Daarna Relocalization op kamerniveau valideren.
- [ ] Later AR-OUT-validatie.

## Daarna
1. **v0.8.22 — Relocalization 2.0** — kalibratiewizard, residuals per punt, foutdetectie, kwaliteits-UI.
2. **AR Core Stability** — lifecycle/cleanup/restart, hit-test/range, reticle, lijn- en labelregressies.
3. **Project Coordinate System** — Project Space → Project Transform → AR World Space; World Lock wordt hierin formeel geïntegreerd.
4. **Werkvlakken** — horizontaal, verticaal, vrij/hellend.
5. **Constructie 2.0** — A→B→C→D, exact, constraints, Smart Snap, referenties.
6. **Editing 2.0** — eigenschappen, maat/positie waar logisch, move/copy/rotate.
7. **UI/HUD 2.0** — menu voor keuze/configuratie, compacte AR-HUD.
8. **CAD-1 Import & Visualize** — GLB/glTF, eenheden, 1:1, model-origin, binnen/buiten.
9. **CAD-2 Placement & Relocalization** — 1/2/3/4+ referenties via dezelfde transform-engine.
10. **CAD-3 Inspect** — objectboom, hide/show, isolate, transparantie, ghost/x-ray, wireframe.
11. **v0.9.0 Measure Engine** — reality↔reality, CAD↔CAD en reality↔CAD.
12. **CAD Spatial** — doorsneden, clipping, sightlines, ruimtelijke inspectie.
13. **CAD Design** — varianten, interieur, annotaties, snapshots.
14. **CAD Verify** — ontwerp versus gebouwde werkelijkheid / as-built-controle.
15. **AR-CAD constructietools** — offset, trim, extend, split, move, copy, rotate, mirror.
16. **Project Explorer** — hiërarchische projectboom en gekoppelde selectie.
17. **2D Plan** — plattegrond en laptopworkflow zonder AR.
18. **Rapportage/export** — PDF, CSV, SVG, GLB; DXF onderzoeken.
19. **Location Projects** — GPS voor projectkeuze, Relocalization voor precieze uitlijning.
20. **Advanced AR** — depth/occlusion, betere rendering, later mogelijke VPS/Geospatial-browserondersteuning.
21. **Architectuurfuncties** — ooghoogte, zichtlijnen, zon/schaduw.
22. **Andere platformen** — later iOS; veel later VR/XR.
23. **Permanente kwaliteitscyclus** — AUTO + relevante PC/AR-tests, cumulatief documenteren.

## Permanente open punten
- Definitieve lijnlabel-oriëntatie en collision avoidance.
- Hit-test/range en reticle-feedback verder verbeteren.
- Punten/lijnen visueel verfijnen; zwevende lijnindruk vermijden.
- Objectlijsten alleen contextueel tonen.
- Back/menu-navigatie altijd betrouwbaar houden.
- De functie **Meten** blijft expliciet gepland voor de grote Measure Engine.
