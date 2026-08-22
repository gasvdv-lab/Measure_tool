# Measure AR v0.8.15 — Objectbeheer & Undo/Redo
Build: 20260822-2215

Deze release introduceert één centrale projecthistorie en breidt objectbeheer uit.

## Nieuw in v0.8.15
- Centrale snapshot-gebaseerde Undo/Redo-engine in `js/history.js`.
- Undo en Redo werken op volledige consistente projectstates, niet op losse halve objecten.
- Nieuwe actie wist de Redo-stack, zoals in CAD-software gebruikelijk.
- Historie bewaart maximaal 80 projectacties.
- Undo/Redo beschikbaar in hoofdmenu én compacte AR-HUD.
- Tekenen van punten/lijnen wordt in dezelfde centrale historie opgenomen.
- Voltooien van polyline en sluiten van vorm wordt als historie-actie geregistreerd.
- Muur aanmaken, wijzigen, zichtbaar/verbergen en verwijderen zijn historie-acties.
- Vorm aanmaken, stijl wijzigen, alleen opvulling verwijderen en vorm+contour verwijderen zijn historie-acties.
- Losse lijnen en punten verwijderen zijn historie-acties.
- `Alles wissen` kan ongedaan worden gemaakt.
- Projectstate wordt na herstel opnieuw op gebroken references gecontroleerd.

## Objectbeheer
### Punt
- Puntnaam achteraf wijzigen.
- Puntnamen blijven uniek.
- Automatisch benoemde lijnen worden mee bijgewerkt wanneer een punt wordt hernoemd.

### Lijn
- Naam wijzigen.
- Kleur wijzigen.
- Dikte wijzigen.
- Label aan/uit.
- Een handmatig aangepaste lijnnaam blijft behouden wanneer later een puntnaam verandert.

### Vorm
- Naam, opvulling, transparantie, randkleur, randdikte en labels blijven achteraf bewerkbaar.
- Alleen vorm/opvulling verwijderen blijft gescheiden van vorm + contour verwijderen.

### Muur
- Naam, hoogte, dikte, zijde, oriëntatie, hoek, kleur en transparantie kunnen achteraf gewijzigd worden.
- Muur blijft gekoppeld aan zijn basislijn.

## Tests automatisch uitgevoerd na genereren — PASS
### Statische applicatietests
- Alle JavaScriptmodules slagen voor syntaxcontrole.
- Alle named imports verwijzen naar bestaande exports.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben een handler.
- Oude tekenmodules blijven verwijderd.
- Nieuwe `history.js` is gekoppeld.
- Undo/Redo-knoppen bestaan in menu en HUD.
- Punt-, lijn- en muurbewerkingsknoppen zijn gekoppeld.

### Historie-algoritmetests — PASS
- Undo brengt de vorige state terug.
- Redo brengt de volgende state terug.
- Een nieuwe actie na Undo wist de Redo-stack.
- Historie wordt begrensd op 80 acties.
- No-op wijzigingen maken geen historie-entry.

### Architectuur/regressie — PASS
- Snapshot bevat punten, lijnen, contouren, vormen en muren.
- Tekensegmenten registreren centrale historie.
- Wall-module schrijft niet meer rechtstreeks losse oude undo-records.
- Puntnaam-editing bestaat.
- Lijnstijl/editing bestaat.
- Muur-editing bestaat.
- Vorm-editing loopt via historie.
- Projectvalidator blijft actief na Undo/Redo.

## Eerder automatisch uitgevoerd — PASS
Alle eerder geslaagde automatische tests uit v0.8.12–v0.8.14 blijven regressie-eisen:
- Gewone lijn A→B.
- Actief eindpunt.
- Polyline A→B→C→D.
- Undo van tekenstap.
- Open Voltooien van polyline.
- Sluiten van vorm.
- Exacte horizontale/verticale afstanden.
- Parallel/Loodrecht/Eigen hoek.
- Dependencybescherming.
- Projectvalidator.
- Mislukte lijn rollback.
- Smart snapping punt/midden/lijn.
- 5-mm-regel bij exacte afstand.
- Constraint-safe snapping.
- HUD/reference/snap-controls.

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

### Objectbeheer — nieuw voor v0.8.15
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

### Undo/Redo — nieuw voor v0.8.15
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
