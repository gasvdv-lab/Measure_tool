# Measure AR v0.8.17 — Muur als zelfstandig tekengereedschap
Build: 20260823-0005

## Nieuw in v0.8.17
- `Muur` is nu een zelfstandig gereedschap in het hoofdmenu.
- Workflow: Muur kiezen → eigenschappen instellen → terug naar AR → A → B → C → D → …
- Elk nieuw eindpunt wordt automatisch het vertrekpunt van het volgende muursegment.
- Dezelfde compacte HUD bepaalt AUTO/exacte afstand en alle bestaande constraints.
- Hoogte, dikte, zijde, oriëntatie, hoek, kleur en transparantie worden vóór het tekenen ingesteld.
- Ieder muursegment krijgt automatisch een unieke naam.
- Interne basislijnen worden automatisch aangemaakt en blijven gekoppeld aan de muur.
- Basislijnlabels zijn verborgen zodat ze het AR-beeld niet onnodig vullen.
- Aangrenzende muursegmenten krijgen een kleine eind-overlap om zichtbare kieren in AR te vermijden.
- `Voltooien` maakt een open `wallpath`; er wordt nooit automatisch terug naar A gesloten.
- Undo/Redo omvat muursegment + basislijn + nieuw punt als één consistente projectstate.
- De oude methode `Maak muur van lijn` blijft voorlopig beschikbaar voor bestaande workflows.

## Automatische tests na genereren — PASS
- JavaScript-syntax: alle modules.
- Named imports/exports.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben een handler.
- Muurtool-pagina en instellingen zijn gekoppeld.
- Tool `wall` bestaat in de centrale drawing core.
- Na ieder segment wordt automatisch een muur aangemaakt.
- Actief eindpunt schuift door naar het volgende segment.
- Muurtool stopt niet automatisch na AB.
- `Voltooien` creëert een open wallpath.
- Basislijnen blijven aanwezig maar hun labels zijn verborgen.
- Automatische unieke muurnamen zijn aanwezig.
- Wall-toolinstellingen zitten in Undo/Redo-snapshots.
- Hoekverbinding heeft AR-vriendelijke overlapcompensatie.
- Centrale Undo/Redo uit v0.8.15 blijft gekoppeld.

## Nieuwe fysieke tests v0.8.17
- Kies Muur en controleer dat het menu sluit na `Muur tekenen starten`.
- A→B: één muur AB verschijnt.
- B→C: BC verschijnt en B blijft gedeelde hoek.
- C→D: CD verschijnt.
- Voltooien: geen automatische D→A muur.
- AUTO-afstand met muur.
- Exact 100 cm met muur.
- Horizontaal met muur.
- Loodrecht met muur.
- Eigen hoek met muur.
- Parallel met muur.
- Muurdikte 10/14/20 cm vergelijken.
- Hoogte wijzigen vóór nieuwe muurmodus.
- Gecentreerd/links/rechts testen.
- Twee muren onder 90°: controleer visueel op kieren/overlap.
- Undo na BC: muur BC, lijn BC en eventueel punt C moeten samen verdwijnen.
- Redo: alles moet terugkomen.
- Alles wissen → Undo: volledig muurpad moet terugkomen.
- Bestaande oude `Maak muur van lijn` workflow blijft werken.

## Gepland — uitgebreide functie Meten
De huidige meetfunctie is nog niet de definitieve meetmodule. Deze wordt later aanzienlijk uitgebreid. Minstens voorzien:
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
- bijkomende meetfuncties die later tijdens ontwikkeling worden bepaald.
Deze roadmapsectie moet in iedere volgende README behouden blijven.

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

### Objectbeheer — nieuw voor v0.8.17
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

### Undo/Redo — nieuw voor v0.8.17
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
