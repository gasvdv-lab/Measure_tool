# Measure AR v0.8.19 — Smart Snapping & Geometrische Intelligentie
Build: 20260823-0105

## Nieuw in v0.8.19
- Centrale Smart Snap-volgorde: bestaand punt → snijpunt → middelpunt → projectie op lijn → opening/muur.
- Exacte bestaande punten hebben hoogste prioriteit.
- 3D-lijnintersecties worden herkend wanneer segmenten elkaar binnen 2,5 cm werkelijk kruisen.
- Middelpunten van bestaande lijnen blijven snapbaar.
- Projectie op een bestaande lijn blijft beschikbaar.
- Hoeken + middelpunt van deur/raam/vrije opening zijn snapreferenties.
- Midden van een muursegment is een aanvullende referentie.
- Alle snaps respecteren de actieve richting/constraint.
- Exacte afstand blijft exact: metric placement springt alleen naar een bestaand punt binnen 5 mm.
- Compacte HUD-knop `SNAP ● / SNAP ○` schakelt snappen onmiddellijk uit of terug aan zonder menu.
- Snapmodus van vóór tijdelijk uitschakelen wordt hersteld.

## Automatisch getest na genereren — PASS
- JavaScript-syntax van alle modules.
- Named imports/exports.
- Unieke HTML-ID's en bestaande UI-referenties.
- Alle statische knoppen hebben handlers.
- Snap-prioriteiten punt=0, snijpunt=1, midden=2, lijn=3, opening=4, muur=5.
- 3D segment-intersectie-engine aanwezig.
- Opening-snapreferenties aanwezig.
- Muurreferentie aanwezig.
- Constraintcontrole wordt op snapkandidaten toegepast.
- Metric placement behoudt 5-mm exactheidsregel.
- SNAP HUD-toggle aanwezig en gekoppeld.

## Nieuwe fysieke tests v0.8.19
- Start nieuwe lijn nabij bestaand punt B: `SNAP ● · punt` en exact B hergebruiken.
- Richt nabij middelpunt AB: midden moet worden gekozen als geen punt dichterbij is.
- Richt op binnenzijde AB: projectie moet exact op AB liggen.
- Maak twee kruisende lijnen en snap op hun snijpunt.
- Test twee lijnen die in 3D over elkaar heen lopen maar >2,5 cm verschillen: geen vals snijpunt.
- Snap op vier raamhoeken en raammidden.
- Snap op deurhoeken.
- Snap op midden van muursegment.
- Test snaps met horizontaal, verticaal, parallel en loodrecht actief.
- Exact 100 cm: snap mag de afstand niet ongemerkt wijzigen.
- Tik `SNAP ●`: moet `SNAP ○` worden en geen geometrie aantrekken.
- Tik opnieuw: vorige snapmodus moet terugkomen.
- Test lijn, polyline, vorm en muur met Smart Snap.
- Undo/Redo na een segment dat een bestaand snappunt hergebruikt.

## Gepland — uitgebreide functie Meten
De huidige meetfunctie is nog niet de definitieve meetmodule en wordt later aanzienlijk uitgebreid. Minstens voorzien:
- enkele afstand;
- doorlopend meten;
- totale lengte;
- horizontale en verticale afstand;
- hoogteverschil;
- hoek en helling;
- oppervlakte en omtrek;
- koppeling aan de Smart Snap-engine, referentielijnen en tekenvlakken;
- aanvullende meetfuncties die tijdens verdere ontwikkeling worden bepaald.
Deze roadmapsectie blijft in iedere volgende README staan.

## Volgende ontwikkelrichting
- v0.8.20: projecten persistent opslaan en herladen.
- Daarna keuze tussen verdere constructie-objecten en de grote uitbreiding van Meten.

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

### Objectbeheer — nieuw voor v0.8.19
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

### Undo/Redo — nieuw voor v0.8.19
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
