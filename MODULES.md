# Measure AR — Modules

Actuele cumulatieve modulehandleiding. Bij iedere release moet dit document worden bijgewerkt wanneer een module of werking verandert.

**Huidige appversie:** v0.8.29.1

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

## 13. Toekomstige Measure Engine
**Status:** gepland.  
De meetfunctionaliteit wordt later aanzienlijk uitgebreid. Dezelfde meetengine moet uiteindelijk ook op CAD- en Buildergeometrie kunnen werken.


## CAD Preview
**Status:** actief vanaf v0.8.29.1.

Losse niet-AR 3D-preview tussen bestandskeuze en CAD-placement. Toont het model 1:1, vaste aanzichten, afmetingen en modelcomplexiteit. De preview verandert de geometrie of schaal niet. Pas na expliciete acceptatie wordt het model aan het project toegevoegd.


## Productrichting vanaf v0.8.29.1
Measure AR groeit domeinonafhankelijk rond **Measure · Place · Create · Experience · Verify**, met Capture als contextuele laag. Nieuwe modules worden ontworpen richting gedeelde Spatial Objects, universele Select/Edit, constraints/relaties, Environment Context, Clearance/Collision, Object Library, Variants/Scenes en Presentation/Experience. AI interpreteert intentie; exacte geometrie en berekeningen blijven deterministisch. Wegenis- en bedrijfsspecifieke wegenbouwworkflows vallen buiten deze app. **v0.8.29.2 — Startinterface / Navigation Core** is nu gebouwd. De startlaag routeert taakgericht naar bestaande functies zonder de stabiele AR/World Lock/geometry-core te herschrijven. **Plaatsen** gebruikt rechtstreeks de aparte CAD-import/previewflow; **Ervaren** en **Controleren** zijn zichtbaar als toekomstige hoofdrichtingen maar nog niet actief. De volgende geplande stap is **v0.8.29.3 — CAD Preview 2.0**.
