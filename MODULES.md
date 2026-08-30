# v0.8.36.4 — UI Action Audit

De UI-bindingslaag is integraal gecontroleerd. `cadResumeArBtn` is nu gekoppeld aan `resumeARFromGesture()` + `restoreCadRuntime()` + CAD-placement. Dit is noodzakelijk omdat WebXR hervatten vanuit een directe gebruikersactie moet gebeuren. Overige functionele modules zijn niet inhoudelijk gewijzigd.

# v0.8.36.3 — PWA / Installatiemodule

## `manifest.webmanifest`
Definieert **AR construct** als installeerbare webapp, standalone startgedrag en appiconen.

## `js/pwa.js`
Registreert de service worker, vangt de Android/Chrome-installatieprompt op en beheert de knop **Installeer AR construct**.

## `service-worker.js`
Minimale network-only service worker. Bewust geen cache-first app-code om regressies door oude JS-builds te voorkomen.

## v0.8.36.2.2 wijziging — drawing-core
`setConstraint()` herbewapent een voltooide gewone lijntool voor een volgende constraintlijn. Dit repareert de state-machine overgang `complete → drawing` die ontbrak.

# Module-update v0.8.36.2.1

## Direction & Angle Constraint Engine
Ondersteunt vrije/horizontale/asvaste/verticale/surface/parallel/loodrechte/eigen-hoek-richtingen. In v0.8.36.2.1 is loodrecht uitgebreid met een horizontale en verticale 3D-modus. Voor loodrecht kan het eerste punt rechtstreeks uit een willekeurige positie op de gekozen referentielijn worden afgeleid; de projectie blijft deterministische geometrie. Eigen hoek kan na configuratie expliciet naar de compacte tekenmodus worden gesloten.

---

# v0.8.36.1 modulewijziging

**World Lock** — per-point WebXR anchor repair. Surface-confirmed points prefer `XRHitTestResult.createAnchor()` independently of `XRFrame.createAnchor()`. Een individuele anchorfout schakelt World Lock niet langer globaal uit. Project Space blijft geometrische waarheid.

# Module-update v0.8.36 — Clearance & Collision 2.0

## Clearance Engine
**Status:** foundation geïntegreerd; fysieke AR-gate vereist.

Nieuwe module `js/clearance.js` behandelt object-object vrije ruimte als afzonderlijk meetobject. Ondersteunde doelen in deze fase: muren, shapes, AI Builder-objecten en geplaatste CAD-modellen. De engine gebruikt de actuele 3D-begrenzing uit de scene en berekent deterministisch X/Y/Z-scheiding, kortste Euclidische vrije ruimte, aanraking en AABB-overlap.

Een opgeslagen clearancecheck bevat objectreferenties, naam, minimale vereiste afstand, eenheid en timestamps. Checks gaan mee in History/Undo/Redo en project snapshots/recovery.

**Bewuste beperking:** v0.8.36 is AABB-gebaseerd. Dit is nog geen exacte mesh-collision, swept-volume of bewegingsruimte-engine.

---

# Module-update v0.8.35

## Measure Engine — Volume / Clearance Foundation
**Volume:** een bestaande gesloten vorm kan een hoogte/diepte krijgen. Volume = exacte footprint-oppervlakte × hoogte/diepte.

**Clearance:** een bestaande lijnmeting kan als vrije-ruimtecontrole worden gebruikt met een minimale vereiste afstand. De app rapporteert marge of tekort. Dit is de fundering voor latere collision/fit-analyse tussen Spatial Objects en de omgeving.

# Module-update v0.8.35

## Measure Engine — Height & Vertical
**Status:** actief, fysieke AR-gate vereist.

Een lijn blijft de geometrische bron. De Measure Engine leidt daar deterministisch drie grootheden uit af: 3D-lengte, absoluut hoogteverschil en horizontale projectie. Een vrijwel verticale lijn (maximaal 25 mm horizontale afwijking) wordt als hoogtemeting gepresenteerd. De bestaande verticale tekenconstraint levert daarmee een directe hoogteworkflow zonder een tweede geometriesysteem te introduceren.

## Area Measurement
**Status:** geïntegreerd in Metingen.

Gesloten shapes gebruiken de bestaande vlakke-contouranalyse voor oppervlakte en omtrek. De area formatter is nu expliciet onderdeel van de gedeelde state-formatters.

---

# v0.8.32.1 module-update — Horizontal Axis Lock

**Drawing Core / Constraints**
- De bestaande horizontale constraint heet in de HUD nu **Horizontaal · vrij**.
- Nieuwe constraint **Horizontaal · asvast** vergrendelt een segment op de dichtstbijzijnde horizontale X- of Z-hoofdas.
- Bij vrije afstand wordt de vizierpositie orthogonaal op die as geprojecteerd.
- Bij exacte afstand bepaalt het vizier alleen welke as/richting gekozen wordt; de ingevoerde metrische afstand blijft de geometrische lengte.
- Dezelfde constraint-validatie wordt gebruikt door Smart Snap, zodat snapping de asvergrendeling niet mag breken.

---

# v0.8.32 module-update — Measure Engine: Polyline & Angles

**Measure Engine / geometry.js**
- `analyzePolyline()` berekent segmentlengtes, totaallengte en hoeken vanuit permanente Project Space-punten.
- `updatePolyline()` beheert naam/eenheid zonder brongeometrie te herschalen.
- Open polylines krijgen meetmetadata (unit/timestamps/measurement).

**Drawing Core**
- De bestaande polyline-tekenflow blijft gelijk; pas bij Voltooien worden segmenten gekoppeld aan het polyline-meetobject.

**UI / Metingen**
- Metingen toont zowel losse afstandsmetingen als doorlopende meetobjecten.
- Polyline-detail toont elk segment, de totale lengte en elke tussenhoek.

**History / Storage**
- Polyline-meetmetadata wordt in snapshots meegenomen.

---

# v0.8.31 — Measure Select & Edit + mm

## Measure Engine
**Status:** actief in opbouw.

De eerste Measure Engine-laag maakt een gewone AR-lijn expliciet tot een persistent afstandsmeetobject. Elke meting kent zijn start- en eindpunt, metrische lengte, naam, voorkeureenheid (mm/cm/m), kleur, dikte, lijnzichtbaarheid, maatlabelzichtbaarheid en aanmaak-/wijzigmoment.

**Gebruik:** teken via **Lijn**, open daarna **☰ → Metingen**. Vanuit de meetlijst kan de lijn worden geopend en aangepast. De meetdata wordt meegenomen in Undo/Redo en de bestaande projectopslag/recovery.

**Architectuur:** de broncoördinaten van punten blijven de geometrische waarheid. De lengte wordt uit de punten bepaald; presentatie-eenheid en visuele stijl zijn eigenschappen van het meetobject. Hierdoor kan dezelfde engine later worden uitgebreid naar polylines, hoeken, oppervlakten, hoogtes, volumes en uiteindelijk CAD-metingen.

### Select & Edit-laag — v0.8.31
De bestaande afstandsmeting kan vanuit **Metingen** worden geselecteerd en aangepast zonder de geometrische lengte te herschrijven. Bewerkbare presentatie-eigenschappen zijn naam, mm/cm/m, kleur, dikte, lijnzichtbaarheid en maatlabelzichtbaarheid. De bronafstand blijft metrisch in meter opgeslagen; eenheidswissels veranderen alleen invoer/weergave.

## CAD
**Status:** functioneel aanwezig maar ontwikkeltraject voorlopig geparkeerd. De bestaande implementatie wordt niet verwijderd en kan later opnieuw op de Measure Engine worden aangesloten.

---

# v0.8.29.1.3 — State Fix

De AR-, teken-, geometrie-, opslag-, CAD-, wall- en world-lockmodules delen opnieuw één canonieke `state.js`-module-instantie. Dit herstelt punt- en lijncreatie na succesvolle WebXR hit-test.

# Tijdelijke diagnostiek

v0.8.29.1.2 voegt uitsluitend een live XR hit-test diagnose-HUD toe.

# Measure AR — Modules

Actuele cumulatieve modulehandleiding. Bij iedere release moet dit document worden bijgewerkt wanneer een module of werking verandert.

**Huidige appversie:** v0.8.32.1

## 1. AR Core
**Status:** actief / core.  
Beheert WebXR-sessie, hit-test, camera/renderloop, reticle en veilige lifecycle. Start via **AR starten**. De core blijft deterministisch; experimentele modules mogen de WebXR-lifecycle niet overnemen.

## 2. Tekenen & Meten
**Status:** actief, verdere grote uitbreiding gepland.  
Maakt punten, lijnen, polylijnen en vormen in AR. Open ☰ en kies de gewenste tekenfunctie. Richt op een bruikbaar oppervlak en bevestig punten met de ronde bevestigingsknop. Exacte afstand, richtingsconstraints en snapping zijn via de HUD beschikbaar.

## 3. Vormen
**Status:** actief.  
Een gesloten contour kan als benoemde vorm worden opgeslagen met opvulling, randstijl en labels. Vormen zijn nu ook brongeometrie voor het AI Builder-prototype. Open **Objecten → Vormen → [vorm]** voor eigenschappen en AI Builder.

## 4. Muren & Openingen
**Status:** actief.  
Muren worden op basis van lijnen gemaakt met hoogte, dikte, zijde en oriëntatie. Aan muren kunnen deuren, ramen en vrije openingen worden toegevoegd.

## 5. Projectbeheer
**Status:** actief.  
Projecten kunnen lokaal worden opgeslagen, hersteld, gedupliceerd, geëxporteerd en geïmporteerd. Recovery beschermt niet-opgeslagen wijzigingen. AI-concepten worden vanaf v0.8.29.0 mee opgenomen in project snapshot/recovery.

## 6. Projectreferenties & Relocalization
**Status:** in ontwikkeling / bekende open bug.  
Bedoeld om een opgeslagen project opnieuw op zijn fysieke locatie uit te lijnen met referentiepunten en locatie-/oriëntatiehints. De reference-captureflow heeft nog een bekende openstaande praktische bug en geldt niet als stabiel opgelost.

## 7. World Lock / Hybrid Localization
**Status:** actief/experimenteel afhankelijk van browserondersteuning.  
Ondersteunt ruimtelijke stabiliteit, anchors waar beschikbaar, heading en opgeslagen ruimtelijke context.

## 8. CAD / 3D-model
**Status:** importflow aanwezig; fysieke placementtest nog open.  
GLB/glTF wordt via een aparte importpagina geladen zodat de Android native file picker de actieve AR-documentcontext niet beschadigt. Na import wordt een nieuwe AR-sessie gestart en kan het model worden geplaatst, geroteerd en in hoogte aangepast.

## 9. Professionele kleurkiezer
**Status:** actief; fysieke Android-validatie blijft wenselijk.  
Gedeelde kleurkiezer voor lijn-, muur- en vormkleuren met theme colors, matrix, recente kleuren, HEX/RGB/HSV en geavanceerde keuze.

## 10. App-thema's
**Status:** actief.  
Via **Instellingen → App-thema** zijn vijf interfaces beschikbaar: Technical Green, Survey Blue, Industrial Orange, Precision Red en Neutral Steel. Functionele statuskleuren blijven semantisch onafhankelijk.

## 11. AI Parametric Builder
**Status:** experimenteel prototype vanaf v0.8.29.0.

### Doel
Natuurlijke taal gebruiken om bestaande Measure AR-geometrie om te zetten in controleerbare parametrische objecten. AI/interpreter bepaalt de intentie; Measure AR blijft eigenaar van exacte geometrie, positie, projectstate en rendering.

### Prototypegebruik
1. Teken een gesloten, horizontale vorm en sla ze op.
2. Open **☰ → Objecten → Vormen → jouw vorm**.
3. Kies **✨ AI Builder · prototype**.
4. Typ bijvoorbeeld: `Maak hier een houten kist van 50 cm hoog`.
5. Kies **Concept maken / aanpassen**.
6. Het gegenereerde concept gebruikt de exacte contour van de vorm als footprint en extrudeert deze met de opgegeven hoogte.
7. Pas hetzelfde object aan met bijvoorbeeld `Maak hem 80 cm hoog` of `Maak hem 20 cm hoger`.
8. Kies **Concept vastzetten** wanneer je tevreden bent. Een vastgezet concept wordt niet via tekst gewijzigd totdat het opnieuw is ontgrendeld.

### Wat dit prototype bewust nog niet is
Geen echte externe AI/LLM, geen willekeurige mesh-generator, geen uitgewerkte planken/verbindingen, geen Detailed Builder en geen Project Builder. De beperkte lokale interpreter bewijst eerst de architectuur veilig.

### Geplande Builder-niveaus
- **Concept:** snel volume om schaal/ruimte te controleren.
- **Detailed Builder:** parametrisch object met afzonderlijke onderdelen.
- **Project Builder:** volledige samengestelde constructie, stapsgewijs opgebouwd.

### Langetermijnrichting
Selecties van punten/lijnen/vormen/vlakken/CAD als context; conversational editing; component-locking; binnenkant/buitenkant/constructielagen; ruimtes en negatieve vrije zones; objectrelaties en afhankelijke maten; collision/clearance; ontwerpvarianten; materialen, voorraad en zaaglijsten; reverse engineering; Design ↔ As-built; toleranties en doelgestuurd space planning. Constructieve veiligheid vereist later afzonderlijke gevalideerde engineeringlogica en mag niet door generatieve AI worden gegarandeerd.

## 12. Historie (Undo/Redo)
**Status:** actief.  
Projectmutaties worden als snapshots bijgehouden. Vanaf v0.8.29.0 vallen AI-concepten eveneens onder undo/redo.

## 13. Measure Engine
**Status:** actief in opbouw vanaf v0.8.30.  
De foundation voor persistente afstandsmeetobjecten is actief. Volgende lagen zijn universele Select/Edit, polyline/hoek, oppervlakte, hoogte/loodrecht en volume/clearance. Dezelfde engine moet later ook op CAD- en Buildergeometrie werken.


## CAD Preview
**Status:** actief vanaf v0.8.29.1.

Losse niet-AR 3D-preview tussen bestandskeuze en CAD-placement. Toont het model 1:1, vaste aanzichten, afmetingen en modelcomplexiteit. De preview verandert de geometrie of schaal niet. Pas na expliciete acceptatie wordt het model aan het project toegevoegd.

### Direction & Angle Constraint Engine — v0.8.36.2
De tekenkern behandelt asvast, parallel, loodrecht en eigen hoek als deterministische richtingsconstraints. Asvast ondersteunt expliciete X+/X−/Z+/Z− keuze; referentieconstraints gebruiken een gekozen bestaande lijn en een expliciete zijde.
