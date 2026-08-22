# Measure AR v0.8.16 — Shape Engine Hardening
Build: 20260822-2349

## Nieuw
- Zelfkruisende vormen worden geweigerd.
- Punten dichter dan 5 mm worden geweigerd.
- Segmenten korter dan 1 cm worden geweigerd.
- Vlakheidscontrole: maximaal 3 cm afwijking.
- Oppervlakte én omtrek worden berekend.
- CW/CCW-orientatie wordt intern bepaald.
- Triangulatie wordt gecontroleerd vóór een vorm wordt aangemaakt.
- De volledige contour wordt gevalideerd vóór Sluiten mutaties uitvoert.
- Undo/Redo en objectbeheer uit v0.8.15 blijven behouden.

## Automatische tests na genereren — PASS
- JavaScript-syntax: alle modules.
- Zelfkruisingsguard aanwezig.
- 5-mm dubbele-puntguard aanwezig.
- 1-cm segmentguard aanwezig.
- 3-cm vlakheidsguard aanwezig.
- Omtrekberekening gekoppeld aan UI.
- Triangulatieguard aanwezig.
- Shape pre-validatie vóór definitief sluiten aanwezig.

## Nieuwe fysieke tests v0.8.16
- Rechthoek vloer: oppervlakte en omtrek vergelijken met handmeting.
- Dezelfde vorm omgekeerd tekenen.
- Verticale rechthoek op muur.
- Schuine vlakke vorm.
- Bow-tie/zelfkruising: Sluiten moet weigeren.
- Twee punten <5 mm: weigeren.
- Segment <1 cm: weigeren.
- Punt >3 cm uit vlak: weigeren.
- Undo/Redo na Sluiten.
- Vormstijl na Undo/Redo wijzigen.

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

### Objectbeheer — nieuw voor v0.8.16
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

### Undo/Redo — nieuw voor v0.8.16
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

