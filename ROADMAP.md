## v0.8.28.8 — AR HUD Refinement ✅

## Huidige stap — v0.8.28.8

- [x] AR Visualization System basislaag
- [x] Technische maatlabelstijl
- [x] Consistente visuele statussemantiek
- [x] Tracking/snap/focus/CAD/outdoor UI-hooks
- [ ] Fysieke AR-praktijktest bij voldoende licht
- [ ] CAD-plaatsing verder valideren
- [ ] Open relocalisatie/reference-capture bug later opnieuw opnemen

- [x] Vizier verder verfijnd.
- [x] AR-HUD compacter en rustiger.
- [x] Actieve tool visueel duidelijk maar klein.
- [x] Lijn-/punt-/previewlabels subtieler.
- [x] Contextacties compacter.
- [x] Geen functionele JavaScriptwijzigingen.
- [ ] Praktijktest in goed daglicht.
- [ ] CAD-plaatsing in goed daglicht verder valideren.
- [ ] Openstaand: Project op locatie plaatsen / referentie-capture opnieuw oppakken.

## v0.8.28.6 — Professional UI Pass ✅
- [x] UI-only release; functionele JavaScript-modules ongewijzigd.
- [x] Professioneel compact AR-vizier.
- [x] Compactere bevestigingsknop en AR-HUD.
- [x] Hoofdmenu als mobiele bottom sheet.
- [x] Consistente typografie, spacing, kaarten, formulieren en statuskleuren.
- [x] Subtielere punt- en lijnlabels en zoomcontrols.
- [x] Externe CAD-importpagina visueel gelijkgetrokken.
- [ ] Praktijktest UI op Android in daglicht: leesbaarheid, vizierprecisie en bediening.
- [ ] CAD-plaatsing bij voldoende licht verder valideren.
- [ ] Bekende relocalization/reference-capture bug blijft open.

## v0.8.28.5 — External CAD Import Page ✅
- [x] File picker uit hetzelfde WebXR-document verwijderen.
- [x] `cad-import.html` als volledig geïsoleerde importpagina.
- [x] CAD-blob bewaren in IndexedDB en metadata in recovery-project.
- [x] Terugkeer naar vers `index.html` met pending-CAD plaatsingsmodus.
- [x] Nieuwe AR-sessie uitsluitend vanuit nieuwe gebruikers-tik.


# Update v0.8.28.5

- [x] CAD-bestandskiezer uit actieve WebXR-sessie gehaald.
- [x] Veilige CAD-importworkspace buiten AR toegevoegd.
- [x] Project- en CAD-state behouden tijdens gecontroleerde AR-pauze.
- [x] Nieuwe expliciete AR-herstart voor CAD-plaatsing.
- [ ] Bekende relocalization/reference-capture bug blijft open en is niet onderdeel van deze fix.

# ROADMAP — Measure AR

## v0.8.28.5 — CAD Resume Fix ✅
- [x] WebXR `requestSession()` direct vanuit de hervat-tik uitvoeren.
- [x] CAD-runtime expliciet opnieuw laden na een nieuwe XR-sessie.
- [x] CAD-context behouden bij resume-fout; Home blijft geblokkeerd.
- [ ] Praktijktest Android: import → hervatten → vizier → CAD plaatsen.


- [x] CAD-1 Import & Placement: GLB/glTF import, 1:1 schaal, handmatige AR-plaatsing, lokale IndexedDB-opslag.
- [ ] CAD-2 Placement/Relocalization: CAD automatisch terugplaatsen na betrouwbare spatial restore.
- [ ] CAD-3 Inspect: transparantie, objectselectie, visibility en modelinfo.
- [ ] Open bug: referentie-capture bij Project op locatie plaatsen.

# Status v0.8.27.1
- [x] Project Transform Core: brongeometrie blijft immutable bij relocalisatie.
- [x] Precision capture basis + referentie-integriteit.
- [ ] Fysieke regressietest v0.8.27.1 (reference capture, projectwissel, restore, World Lock).

# v0.8.23 Spatial Restore

Project Space blijft de geometrische waarheid. Bij het openen van een opgeslagen project met referentiepunten start nu automatisch de positieherstel-flow. De gebruiker wijst dezelfde fysieke referenties opnieuw aan; Measure AR berekent daaruit de transformatie van het permanente Project Origin naar de nieuwe WebXR-sessie. 4+ referenties gebruiken best-fit en residualcontrole.

# Measure AR — Master Roadmap

**Huidige versie:** v0.8.28.6 — Professional UI Pass  
**Huidige gate:** Project Manager Stability praktisch valideren; World Lock voor eenvoudige en samengestelde geometrie is door de gebruiker positief getest.

## Testcodes
`AUTO` · `PC` · `AR-IN/A4` · `AR-IN/ROOM` · `AR-OUT`

## Nu — Core herstel

### v0.8.21.6 — Project Manager Stability
- [x] Projectkopie loskoppelen van `loadStoredProject()`.
- [x] Wissen van project laat `Mijn projecten` open.
- [x] Niet-actief project wissen wijzigt actieve scène niet.
- [x] Actief project wissen bewaart scène als niet-opgeslagen kopie + recovery.
- [x] Stale `lastProjectId` en recovery opruimen.
- [x] Last-project pas laden wanneer AR-scène gereed is.
- [x] Recovery beschermen tegen automatische last-project load.
- [x] Lifecycle-events rond load/new/save transactioneel maken.
- [x] Index repareren vanuit valide storage-envelopes.
- [x] Import ID-conflicten veilig behandelen en lokaal registreren.
- [x] AUTO gerichte regressiecontrole.
- [ ] **AR-IN:** A/B save-open-copy-delete workflow praktisch valideren.
- [ ] **AR-IN:** herstart + recovery + import/export praktisch valideren.

### v0.8.21.6 — Shape Closure Fix
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


## v0.8.21.6 — Project Manager UX
- Projectmanager blijft een overlay boven de actieve AR-sessie.
- Openen, Opslaan, Opslaan als, Nieuw, Importeren en Herstel sluiten de manager en keren terug naar AR.
- Wissen, Hernoemen en Kopiëren blijven in Mijn projecten.
- Mijn projecten gebruikt duidelijke kaarten met ACTIEF-status, statistieken, Openen en een compact Meer-menu.
- Zichtbare toast-feedback voor opslaan/openen/kopiëren/hernoemen/wissen.
- Permanente projectstatus in de AR-topbalk: opgeslagen of gewijzigd.
- Startscherm wordt niet gebruikt als bestemming van Project Manager-acties.

## v0.8.21.8 — Relocalization Menu Access
- [x] Relocalisatie rechtstreeks bereikbaar maken vanuit het AR-hoofdmenu.
- [ ] Fysieke 1/2/3/4+ referentiepunttest uitvoeren.
- [ ] Daarna: v0.8.22 Relocalization 2.0.

### v0.8.21.8 — Relocalization UI Fix
- [x] Relocalisatie-ingang via standaard menunavigatie gekoppeld.
- [ ] AR-IN: bevestigen dat `☰ → Relocalisatie` het scherm `Project uitlijnen` opent.
- [ ] Daarna fysieke 1/2/3/4+ referentiepunttest hervatten.

## v0.8.22 — Project Coordinate System & Spatial Save
- [x] Expliciete project-origin in projectdata
- [x] Ruimtelijke save-metadata gekoppeld aan project
- [x] GPS + referenties + geometrie als één opgeslagen project
- [x] Spatial metadata herstellen bij project load/import/duplicate
- [ ] Fysieke AR-test: save → sessie sluiten → reopen → spatial data behouden
- [ ] Volgende: automatische/semi-automatische relocalisatie op deze project-space basis

- [x] v0.8.22 hotfix: Nieuw project → Project Manager sluiten → terug naar actieve AR-camera, nooit naar startscherm.

### v0.8.24 — World Lock 2.0
- [x] Direct surface-anchor path via XRHitTestResult.createAnchor()
- [x] Frame-anchor fallback for computed points
- [ ] Physical AR gate: committed A→B remains fixed while phone moves
- [ ] After pass: resume Spatial Restore validation


## v0.8.26 — Hybrid Spatial Localization ✅
- [x] Start vanaf stabiele v0.8.24 baseline
- [x] GPS als grove geografische projectlocatie
- [x] Absolute toestelrichting opslaan indien browser/sensor dit levert
- [x] Hybride locatiecheck met afstand en onzekerheid
- [x] Referentiepunten behouden als precisielaag
- [x] Vrij camerabeeld tijdens opnieuw aanwijzen van referenties
- [ ] Volgende experimentele stap: visual relocalization zonder geprinte marker
- [ ] Project Space → AR World Space als expliciete sessietransform, zonder brongeometrie te herschrijven

- [x] v0.8.27.1 Core Repair: reference capture + project/anchor lifecycle hardening.


## v0.8.28 — CAD Import & Placement ✅
- [x] GLB/glTF import.
- [x] 1:1 schaal.
- [x] Vizierplaatsing, rotatie en hoogtecorrectie.
- [x] CAD-metadata in project en bronbestand lokaal in IndexedDB.

## v0.8.28.5 — CAD File Picker Lifecycle Fix ✅
- [x] Android file-picker mag niet meer naar het startscherm navigeren.
- [x] CAD-menucontext behouden wanneer WebXR door de systeemkiezer stopt.
- [x] Projectstate niet destructief leegmaken bij deze externe onderbreking.
- [x] Import en plaatsing ontkoppelen zodat bestand eerst veilig geladen kan worden.
- [x] Expliciete **AR hervatten en CAD plaatsen**-actie na een onderbroken XR-sessie.
- [x] Annuleren van bestandskeuze blijft in CAD-flow.
- [ ] AR-ANDROID: bestand kiezen terwijl AR actief is → nooit startscherm.
- [ ] AR-ANDROID: bestandskeuze annuleren → CAD-scherm behouden.
- [ ] AR-ANDROID: AR hervatten → model volgt vizier en kan bevestigd worden.
- [ ] AR-ANDROID: bestaand project met geometrie → CAD importeren → geometrie/project blijven behouden.

Openstaand blijft: `Project op locatie plaatsen` / witte referentie-captureknop.