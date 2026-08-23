# Measure AR v0.8.20 — Projecten opslaan, herstellen & beheren
Build: 20260823-0310

## Nieuw in v0.8.20
- Eerste echte projectlaag met `schemaVersion: 1`.
- Projecten worden lokaal in Chrome opgeslagen via browseropslag.
- Meerdere projecten met naam, project-ID, aanmaakdatum en wijzigingsdatum.
- `Opslaan`, `Opslaan als nieuw project`, `Nieuw project` en `Mijn projecten`.
- Opgeslagen projecten kunnen worden geopend, hernoemd, gekopieerd en verwijderd.
- Automatische Recovery State na iedere historie-wijziging.
- Bij een latere browserstart wordt aangegeven dat hersteldata aanwezig is.
- Handmatig opslaan wist de Recovery State; nieuwe wijzigingen maken opnieuw hersteldata.
- Export naar leesbaar `.measurear.json`.
- Import van `.measurear.json`/JSON met validatie vóór het huidige project wordt vervangen.
- Ongeldige import laat de bestaande scène intact.
- Projectstatistieken: punten, lijnen, vormen, muren en openingen.
- Alleen brondata wordt bewaard. Three.js meshes, camera, preview en XR-runtime worden niet opgeslagen.
- Bij laden worden punten → lijnen → contouren → vormen → muren → openingen opnieuw opgebouwd.
- Undo/Redo-history wordt bij het openen van een project opnieuw schoon gestart.

## Belangrijke beperking van v0.8.20
Projectopslag bewaart de geometrie betrouwbaar, maar WebXR-wereldcoördinaten zijn sessiegebonden. Een project dat een week later wordt geopend, staat daarom nog niet automatisch opnieuw exact op dezelfde fysieke plek. Dat probleem wordt bewust behandeld in v0.8.21 — AR Project Relocalization.

## Automatische tests na genereren — PASS
- JavaScript-syntax van alle modules.
- Named imports/exports.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben handlers.
- `project-storage.js` aanwezig en gekoppeld.
- SchemaVersion 1 aanwezig.
- Lokale projectindex en individuele projectopslag aanwezig.
- Autosave/Recovery gekoppeld aan historie-wijzigingen.
- Handmatig Opslaan en Opslaan als aanwezig.
- Import en export aanwezig.
- Import valideert referenties vóór laden.
- Foute load heeft rollback naar vorige scène.
- Opslagmodel bevat geen runtime meshes/camera.
- Projectstatistieken aanwezig.
- Project- en projectlijstpagina gekoppeld.
- Schema/JSON roundtriptest PASS.
- Punt→lijn, lijn→muur en muur→opening referentietests PASS.

## Nieuwe fysieke/browser-tests v0.8.20
- Start AR, teken A→B en sla project op.
- Herlaad browser, start AR en open opgeslagen project: geometrie moet reconstrueren.
- Project met vorm, muur, deur en raam opslaan en opnieuw laden.
- Controleer projectstatistieken vóór en na laden.
- Maak twee afzonderlijke projecten en wissel tussen beide.
- Project hernoemen.
- Project dupliceren.
- Project verwijderen.
- `Opslaan als nieuw project`: origineel moet intact blijven.
- Teken zonder handmatig opslaan, herlaad Chrome en controleer Recovery-melding.
- Open Recovery State na starten van AR.
- Handmatig opslaan → recovery moet verdwijnen.
- Nieuwe wijziging → recovery moet opnieuw verschijnen.
- Export `.measurear.json`.
- Importeer hetzelfde bestand en vergelijk alle objecten/maten.
- Importeer bewust beschadigde JSON: huidige project mag niet verdwijnen.
- Alles wissen → autosave/recovery → Undo testen.
- Undo/Redo na projectload: history hoort schoon te starten.
- Chrome naar achtergrond en terug: recovery mag niet beschadigen.
- Project met minstens 50 punten en meerdere muren/openingen opslaan/herladen.

## Gepland — v0.8.21 AR Project Relocalization
Doel: een opgeslagen project dagen/weken later opnieuw op dezelfde reële locatie en oriëntatie kunnen plaatsen. Daarvoor wordt een nieuw AR-coördinatenstelsel gekoppeld aan het opgeslagen project via referentiepunten/referentielijn en waar zinvol locatie-informatie. GPS alleen wordt niet als centimeter-nauwkeurig anker behandeld.

## Gepland — uitgebreide functie Meten
De huidige meetfunctie is nog niet de definitieve meetmodule en wordt later aanzienlijk uitgebreid. Minstens voorzien:
- enkele afstand;
- doorlopend meten;
- totale lengte;
- horizontale en verticale afstand;
- hoogteverschil;
- hoek en helling;
- oppervlakte en omtrek;
- koppeling aan Smart Snap, referentielijnen, tekenvlakken en opgeslagen projecten;
- aanvullende meetfuncties die tijdens verdere ontwikkeling worden bepaald.
Deze roadmapsectie blijft in iedere volgende README staan.

## Nog fysiek te testen — cumulatief
Deze tests vereisen echte WebXR/ARCore en blijven open.

### AR-sessie/tracking
- AR starten.
- Menu openen/sluiten zonder trackingverlies.
- Achtergrond → terug.
- AR opnieuw starten.
- Alles wissen terwijl AR actief blijft.
- Drift gedurende 1–5 minuten.
- Bevestigd punt blijft op fysieke locatie.

### Hit-test / tekenvlakken
- Vloer.
- Verticale muur.
- Schuin vlak.
- Wisselen tussen oppervlakken.
- Op oppervlak blijft in actief vlak.

### Lijn / polyline / vorm
- Gewone A→B en stop.
- A blijft vast.
- A→B→C→D met doorschuivend vertrekpunt.
- Undo en Redo tijdens een polyline.
- Voltooien houdt polyline open.
- Horizontale/verticale/schuine vorm.
- Vorm Sluiten.
- Vlakheidscontrole >3 cm.
- Oppervlakte plausibel.

### AUTO / exacte afstand
- AUTO op meerdere afstanden.
- Exact 50 / 100 / 250 cm.
- Exact 1.50 m.
- Preview vóór bevestiging.
- Alleen witte ronde knop bevestigt.

### Constraints
- Vrij.
- Horizontaal.
- Verticaal omhoog/omlaag.
- Op oppervlak.
- Parallel.
- Loodrecht.
- Eigen hoek 30/45/90°.
- Links/rechts en voor/tegen.

### Snapping
- Smart punt.
- Smart midden.
- Smart lijn.
- Modi afzonderlijk.
- Snapping uit.
- Prioriteit punt > midden > lijn.
- Constraints blijven behouden.
- Exacte afstand blijft exact.
- Snapstatus-chip.

### Referenties
- Dropdown.
- Gebruik laatste lijn.
- Parallel/Loodrecht/Eigen hoek.
- Ref-chip.
- Zijde/Richting-chip.

### Objectbeheer — nieuw voor v0.8.20
- Punt hernoemen en label controleren.
- Automatische lijnnaam verandert mee na punt-hernoeming.
- Lijn handmatig hernoemen en daarna punt hernoemen: custom lijnnaam moet blijven.
- Lijnkleur wijzigen.
- Lijndikte 1/2/3/4 visueel vergelijken.
- Lijnlabel aan/uit.
- Vormstijl aanpassen en visueel controleren.
- Muurhoogte achteraf wijzigen.
- Muurdikte achteraf wijzigen.
- Muur links/rechts/gecentreerd wijzigen.
- Muurkleur/transparantie wijzigen.
- Muurhoek wijzigen.
- Objectbeheer mag tracking niet verstoren.

### Undo/Redo — nieuw voor v0.8.20
- Punt plaatsen → Undo → Redo.
- Lijn A→B → Undo → Redo.
- Polyline meerdere stappen achteruit en opnieuw vooruit.
- Vorm sluiten → Undo → Redo.
- Puntnaam aanpassen → Undo → Redo.
- Lijnstijl aanpassen → Undo → Redo.
- Vormstijl aanpassen → Undo → Redo.
- Muur maken → Undo → Redo.
- Muur aanpassen → Undo → Redo.
- Muur verwijderen → Undo → Redo.
- Alles wissen → Undo moet volledig project terugbrengen.
- Na Undo een nieuwe actie uitvoeren → Redo moet verdwijnen.
- Na minimaal 20 afwisselende acties blijft project consistent.

### Dependencies
- Los punt/lijn wissen.
- Punt uit contour/vorm blokkeren.
- Muur-basislijn blokkeren.
- Alleen vorm verwijderen.
- Vorm + contour verwijderen.
- Undo/Redo van bovenstaande verwijderacties.

### HUD
- Geen overlap.
- Compact/Meer info.
- Undo/Redo-knoppen bruikbaar zonder camerabeeld te blokkeren.
- Disabled-state klopt wanneer Undo/Redo niet beschikbaar is.

## Bekend nog niet opgelost
- Definitieve labeloriëntatie/collision avoidance.
- Deur/raam/openingen.
- Muur nog niet als volledig zelfstandig tekengereedschap.
- Lijnintersectie-snapping komt later.
- Persistente opslag van historie over een browserherstart is nog niet voorzien.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload alle bestanden uit deze ZIP. `js/history.js` is nieuw en moet mee naar GitHub.



Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload de volledige inhoud van deze ZIP naar GitHub.


Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload de volledige inhoud van deze ZIP naar GitHub.


Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/


Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload de volledige inhoud van deze ZIP naar GitHub. `js/project-storage.js` is nieuw en moet mee.
