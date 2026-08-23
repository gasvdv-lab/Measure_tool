# Measure AR v0.8.18 — Openingen in muren
Build: 20260823-0035

## Nieuw in v0.8.18
- Deur, raam en vrije opening zijn echte child-objecten van een muur.
- Iedere opening gebruikt muur-lokale maten:
  - X = afstand vanaf begin van de muur;
  - onderkant = hoogte boven de muurvoet;
  - breedte;
  - hoogte.
- De muur wordt werkelijk visueel opgebouwd rond de opening; er staat dus niet enkel een rechthoek vóór de muur.
- Meerdere niet-overlappende openingen per muur zijn mogelijk.
- Opening wordt gevalideerd tegen muurlengte en muurhoogte.
- Negatieve of ongeldige maten worden geweigerd.
- Overlappende openingen worden geweigerd.
- Deurpreset: 0,90 × 2,10 m vanaf vloer.
- Raampreset: 1,20 × 1,10 m met onderkant 0,90 m.
- Opening kan achteraf volledig worden gewijzigd.
- Opening verwijderen bouwt de massieve muur automatisch terug op.
- Muur verwijderen verwijdert zijn child-openingen mee.
- Muurhoogte kan niet worden verkleind als een bestaande opening er dan buiten zou vallen.
- Openingen zitten in de centrale Undo/Redo-snapshot en projectvalidator.

## Automatische tests na genereren — PASS
- JavaScript-syntax: alle modules.
- Named imports/exports.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben een handler.
- Opening-engine create/update/delete/validate aanwezig.
- Muur-geometrie wordt rond openingen in deelblokken opgebouwd.
- Overlapdetectie aanwezig.
- Openingen zitten in Undo/Redo snapshot/restore.
- Projectvalidator controleert openingsreferenties.
- Overlaptest: overlappende rechthoeken correct gedetecteerd.
- Rand-aan-rand openingen worden niet fout als overlap gezien.
- Standaarddeur past in 4,00 × 2,40 m muur.
- Standaardraam past in 4,00 × 2,40 m muur.
- Te brede opening wordt gedetecteerd.
- Te hoge opening wordt gedetecteerd.

## Nieuwe fysieke tests v0.8.18
- Maak muur van minstens 4 m.
- Voeg standaarddeur toe: controleer echte visuele uitsparing.
- Voeg standaardraam toe.
- Controleer muur zichtbaar rondom raam: onderdorpel, bovenstuk, links/rechts.
- Voeg twee openingen in dezelfde muur toe.
- Probeer overlappende openingen: moet weigeren.
- Probeer opening voorbij muureinde: moet weigeren.
- Probeer opening boven muurhoogte: moet weigeren.
- Pas breedte/hoogte/positie aan en controleer directe muur-rebuild.
- Verwijder opening: muur moet volledig herstellen.
- Undo opening plaatsen → massieve muur.
- Redo → opening exact terug.
- Undo/Redo na verplaatsen opening.
- Verwijder muur met openingen → children moeten mee verdwijnen.
- Undo muur verwijderen → muur + openingen moeten terugkomen.
- Verklein muurhoogte onder een raamtop → moet weigeren.
- Test openingen op muursegmenten AB en BC afzonderlijk.

## Gepland — uitgebreide functie Meten
De huidige meetfunctie is nog niet de definitieve meetmodule en wordt later aanzienlijk uitgebreid. Minstens voorzien:
- enkele afstand;
- doorlopend meten;
- totale lengte;
- horizontale afstand;
- verticale afstand;
- hoogteverschil;
- hoek;
- helling;
- oppervlakte;
- omtrek;
- koppeling aan snapping, referentielijnen en tekenvlakken;
- aanvullende meetfuncties die tijdens verdere ontwikkeling worden bepaald.
Deze roadmapsectie blijft in iedere volgende README staan.

## Volgende ontwikkelrichtingen
- Openingen interactief positioneren door rechtstreeks op de muur te richten.
- Tekenen/snappen op randen en hoekpunten van openingen.
- Later echte deur-/raamobjecten in de opening.
- Geavanceerde snapping en lijnintersecties.
- Projecten persistent opslaan/herladen.

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

### Objectbeheer — nieuw voor v0.8.18
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

### Undo/Redo — nieuw voor v0.8.18
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
