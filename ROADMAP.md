# Actuele status — v0.8.36.2.1

- [x] Direction & Angle Constraint repair
- [x] Eigen-hoek UX: configuratie afsluiten vóór tekenen
- [x] Loodrecht 90° horizontaal/verticaal
- [x] Loodrecht starten vanaf willekeurig punt op referentielijn
- [ ] Fysieke AR-gate v0.8.36.2.1

---

# Update v0.8.36.1

- [x] World Lock position repair: robuustere per-point anchorafhandeling.
- [ ] Fysieke AR-gate: punten, lijnen en vormen moeten na plaatsing op hun fysieke positie blijven.

# Measure AR roadmap — bijgewerkt v0.8.36

## Huidige Measure Engine-fase
- [x] v0.8.30 Measure Engine Foundation
- [x] v0.8.31 Select/Edit + mm
- [x] v0.8.32 Polyline + hoeken
- [x] v0.8.32.1 Horizontal Axis Lock
- [x] v0.8.33 Area Measurement
- [x] v0.8.34 Height & Vertical Measurements
- [x] v0.8.35 Volume / Clearance Foundation
- [x] v0.8.36 Clearance & Collision 2.0 — object-object AABB, minimale vrije ruimte, opgeslagen checks
- [ ] Volgende: Spatial Object / universele Select & Edit foundation

De brede productvisie blijft **Measure · Place · Create · Experience · Verify**, met Capture contextueel. Wegenis-/bedrijfsspecifieke workflows horen niet in deze app.

---

# Measure AR roadmap — bijgewerkt v0.8.35

## Huidige Measure Engine-fase
- [x] v0.8.30 Measure Engine Foundation
- [x] v0.8.31 Select/Edit + mm
- [x] v0.8.32 Polyline + hoeken
- [x] v0.8.32.1 Horizontal Axis Lock
- [x] v0.8.33 Area Measurement
- [x] v0.8.34 Height & Vertical Measurements
- [x] v0.8.35 Volume / Clearance Foundation
- [ ] Volgende: Clearance/Collision 2.0 en/of volumemeting uit twee oppervlakken

# Roadmap-update v0.8.35

- [x] v0.8.30 Measure Engine Foundation
- [x] v0.8.31 Select/Edit + mm
- [x] v0.8.32 Polyline + hoeken
- [x] v0.8.32.1 Horizontal Axis Lock
- [x] v0.8.33 Area Measurement
- [x] v0.8.35 Height & Vertical Measurements
- [ ] v0.8.35 Volume / Clearance Foundation

De brede productrichting blijft Measure · Place · Create · Experience · Verify. CAD blijft in de roadmap maar is niet de huidige ontwikkelfocus.

---

# Measure AR — actuele roadmapstatus

**Huidige versie:** v0.8.32.1 — Horizontal Axis Lock  
**Stabiele baseline:** v0.8.29.1.3 fysiek geslaagd: surface hit → punt A → punt B → lijn.  
**Actieve ontwikkelfase:** Measure Engine.  
**CAD:** voorlopig geparkeerd; bestaande CAD-code blijft behouden voor latere hervatting.

## v0.8.30 — Measure Engine Foundation
- [x] Lijn als expliciet persistent afstandsmeetobject.
- [x] Meetobject bevat start/einde, lengte, naam, eenheid, stijl, zichtbaarheid en timestamps.
- [x] Nieuwe pagina **Metingen** met overzicht en totale lijnlengte.
- [x] Meting openen en eigenschappen bewerken vanuit de meetlijst.
- [x] cm/m per meting.
- [x] Lijn- en maatlabelzichtbaarheid per meting.
- [x] Nieuwe meetvelden opgenomen in Undo/Redo en project snapshot/recovery.
- [x] Alle interne ES-module imports gebruiken opnieuw één build-ID.
- [x] AR-ANDROID: v0.8.30 basispraktijktest geslaagd — lijnmeting werkt.
- [ ] AR-ANDROID: v0.8.31 Select/Edit + mm praktijktest uitvoeren.
- [ ] AR-ANDROID: v0.8.32 Polyline & Angle Measurements praktijktest uitvoeren.

## v0.8.31 — Measure Select & Edit + mm
- [x] Bestaande afstandsmetingen selecteren via **Metingen**.
- [x] Naam, eenheid, kleur, dikte, lijn- en labelzichtbaarheid bewerken.
- [x] Millimeter (mm) toevoegen aan labels, instellingen en exacte-afstand-HUD.
- [x] Geometrische bronwaarde intern in meter behouden.
- [ ] AR-ANDROID: fysieke v0.8.31 regressietest.


## v0.8.32.1 — Horizontal Axis Lock
- [x] Bestaande Horizontaal-mode expliciet als **Horizontaal · vrij** tonen.
- [x] Nieuwe **Horizontaal · asvast** constraint toevoegen.
- [x] Automatisch vergrendelen op dichtstbijzijnde horizontale X/Z-hoofdas.
- [x] Asvast ondersteunen voor vrije én exacte afstand.
- [x] Constraint-validatie en Smart Snap blijven geometrisch consistent.
- [ ] AR-ANDROID: fysieke v0.8.32.1 praktijktest.

## v0.8.32 — Polyline & Angle Measurements
- [x] Bestaande Doorlopende lijn als expliciet meetobject registreren.
- [x] Segmentlengtes en totale trajectlengte berekenen.
- [x] Hoeken op alle tussenpunten berekenen.
- [x] Polyline-meetdetails tonen via **Metingen**.
- [x] Naam en mm/cm/m per polyline-meting.
- [x] Metadata in Undo/Redo en project snapshot/recovery.
- [ ] AR-ANDROID: fysieke v0.8.32 praktijktest.

## Eerstvolgende Measure Engine-stappen
1. **Measure 2 — Select/Edit interaction:** universele selectie van ruimtelijke objecten vanuit AR, niet alleen via lijsten.
2. **Measure 3 — Polyline & hoekmetingen:** ✅ foundation in v0.8.32; later AR-selectie/hoeklabels verfijnen.
3. **Measure 4 — Oppervlakte:** gesloten meetcontouren met oppervlakte en omtrek.
4. **Measure 5 — Hoogte / verticaal / loodrecht:** betrouwbare hoogte- en offsetmetingen.
5. **Measure 6 — Volume & clearance:** volumes, vrije ruimte en ruimtelijke relaties.
6. Later: dezelfde Measure Engine opnieuw koppelen aan CAD voor CAD↔CAD en reality↔CAD.

## Geparkeerde/open punten
- CAD-2 Placement/Relocalization en CAD-3 Inspect: later hervatten.
- `Project op locatie plaatsen` / reference-capture: bekende open bug; niet opgelost verklaard.
- Definitieve oriëntatie/meedraaien van lijnlabels: later hernemen.

---

# Fixrelease v0.8.29.1.3 — State Fix ✅

- [x] Dubbele `state.js` module-instanties door gemengde cache-busting querystrings verwijderd.
- [x] Alle interne module-imports op één build-ID gezet.
- [x] Rendering-state guard toegevoegd voor punt- en previewgeometrie.
- [ ] Praktijktest op Android/Chrome: eerste punt + tweede punt + lijn tekenen.

# Diagnostische tussenrelease v0.8.29.1.2

Surface-detection oorzaak isoleren vóór verdere featureontwikkeling.

# Measure AR Roadmap

## Historische status — v0.8.29.1 CAD Preview

## v0.8.29.1 — CAD Preview ✅
- [x] GLB/glTF-preview buiten WebXR vóór importacceptatie.
- [x] Orbit/zoom en vaste 3D-, boven- en vooraanzichten.
- [x] 1:1-afmetingen, mesh/triangle-aantallen en bestandsgrootte vóór AR tonen.
- [x] Geen automatische schaalcorrectie; alleen waarschuwing bij verdachte afmetingen.
- [x] Bestand pas na expliciet **Model gebruiken** in IndexedDB/project opnemen.
- [ ] AR-ANDROID: preview → Model gebruiken → terug naar AR → CAD plaatsen fysiek testen.
- [ ] Openstaand: reference-capture / Project op locatie plaatsen later verder repareren.


- [x] AI Builder als geïsoleerde experimentele module toegevoegd.
- [x] Conceptmodus: geselecteerde vorm als exacte footprint.
- [x] Lokale deterministische opdrachtinterpreter voor kist/box/blok/volume + exacte hoogte.
- [x] Bestaand concept via teksthoogte aanpassen.
- [x] Concept vastzetten/ontgrendelen en verwijderen.
- [x] AI-concepten opgenomen in historie en project snapshot/recovery.
- [x] MODULES.md toegevoegd als cumulatieve modulehandleiding.
- [ ] Fysiek testen op Android/Chrome/WebXR.
- [ ] Verifiëren dat AI-concept na opslaan, sluiten en herstellen exact terugkomt.
- [ ] Verifiëren undo/redo van maken, aanpassen, lock en verwijderen.
- [ ] Echte AI/LLM-provider pas later kiezen; geen secrets in GitHub Pages-clientcode.
- [ ] Detailed Builder: parametrische onderdelen en eigenschappen.
- [ ] Project Builder: componenthiërarchie, lock per onderdeel, binnen/buiten/constructielagen.
- [ ] Spatial/Constraint Engine: vrije zones, relaties, collision en clearance.
- [ ] Material Engine, zaaglijsten en optimalisatie.
- [ ] Design ↔ As-built en toleranties.
- [ ] Open bug: Project op locatie plaatsen/reference capture opnieuw oppakken.
- [ ] CAD-placement v0.8.28.x fysiek testen bij voldoende licht.
- [ ] Oriëntatie/meedraaien van lijnlabels later opnieuw oppakken.

---

## v0.8.28.10 — Theme Selector ✅
- [x] Vijf samenhangende professionele interface-thema’s
- [x] Themawissel onder Instellingen
- [x] Directe preview en actieve-thema-indicatie
- [x] Keuze lokaal onthouden tussen sessies
- [x] Thema doorgetrokken naar externe CAD-importpagina
- [x] Semantische statuskleuren blijven thema-onafhankelijk
- [ ] Praktijktest op Android/Chrome
- [ ] CAD-plaatsing verder valideren bij voldoende licht
- [ ] `Project op locatie plaatsen` / reference-capture bug blijft open voor latere herneming

# Historische stap — v0.8.28.9 Professional Color Picker

- [x] Eén professionele colorpicker voor alle huidige kleurvelden.
- [x] Themakleuren + tintenmatrix.
- [x] Recente kleuren lokaal onthouden.
- [x] Geavanceerde HSV-kleurselectie.
- [x] HEX + RGB invoer en huidig/nieuw-preview.
- [x] Mobiele bottom-sheet presentatie zonder externe dependency.
- [ ] Fysieke Android-test van alle kleurvelden.
- [ ] Later: optionele projectfavorieten/palet.
- [ ] Later: pipet waar browserondersteuning voldoende betrouwbaar is.
- [ ] Fysieke AR-praktijktest bij voldoende licht.
- [ ] CAD-plaatsing verder valideren.
- [ ] Open relocalisatie/reference-capture bug later opnieuw opnemen.

## v0.8.28.8 — AR HUD Refinement ✅

## Historische stap — v0.8.28.8

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

**Historische status:** v0.8.28.6 — Professional UI Pass  
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
- [x] v0.8.36.2 — Direction & Angle Constraint Repair: expliciete asrichting, betrouwbare 90° op referentielijn en eigen hoek op referentielijn.
