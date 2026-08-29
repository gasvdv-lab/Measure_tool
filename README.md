# Measure AR v0.8.21.2 — Constraint Regression Audit
Build: 20260829-0915

## v0.8.21.2 — constraint audit / bugfix
Deze patch volgt op de praktijkmelding dat **Verticaal** instabiel meebewoog en op de eerdere fout bij **Horizontaal + exacte afstand**. De volledige tekenconstraintlaag is opnieuw nagekeken.

Wijzigingen:
- Exact **Verticaal** is nu camera-onafhankelijk en blijft exact op de verticale as door het actieve vertrekpunt.
- Verticaal heeft expliciet **omhoog/omlaag** via de richtingschip.
- AUTO Verticaal blijft op dezelfde verticale as en respecteert de gekozen omhoog/omlaag-richting.
- AUTO **Parallel / Loodrecht / Eigen hoek** respecteert nu werkelijk de gekozen zijde/richting; voorheen kon `side` algebraïsch wegvallen.
- Runtime-invariantcontrole toegevoegd: kandidaat moet de gekozen constraint én ingestelde exacte afstand respecteren voordat bevestigen mogelijk is.
- Constraintwaarden worden gevalideerd; onbekende waarde valt veilig terug op Vrij.
- Muur-scèneobjecten krijgen een ID-tag en de projectconsistentiecontrole detecteert ontbrekende of verweesde muurweergaven.

**Belangrijk:** echte WebXR-tracking kan niet automatisch worden nagebootst. AUTO-tests valideren code, state en geometrische invariantlogica; AR-IN blijft nodig voor camera/trackinggedrag.

Vaste app-link: https://gasvdv-lab.github.io/Measure_tool/

## Bugfix in v0.8.21.2
Bij **exacte afstand + Horizontaal** werd de richting voorheen rechtstreeks afgeleid van de camera-kijkrichting. Daardoor kon de previewlijn vanuit het actieve vertrekpunt parallel aan de kijkrichting lopen in plaats van naar de positie te wijzen waarop het vizier mikte.

De exacte plaatsing gebruikt nu de geometrische richting **van het actieve vertrekpunt naar de ray/plane-intersectie van het vizier**. Daardoor gelden tegelijk:
- de ingestelde afstand blijft exact;
- het eindpunt blijft horizontaal in de AR-wereld;
- preview en bevestigde geometrie gebruiken dezelfde kandidaatpositie;
- de richting volgt de bedoelde vizierzijde vanaf het vertrekpunt.

Dezelfde richtingsbasis is ook consistenter gemaakt voor Vrij, Verticaal en Op oppervlak bij exacte afstand. Parallel, Loodrecht en Eigen hoek blijven referentiegestuurd.

## AUTO teststatus v0.8.21.2 — PASS
- JavaScript syntax van alle modules.
- Alle relatieve module-importpaden bestaan.
- Geen dubbele HTML-ID's.
- Uniforme cache/build-key `0.8.21.2-20260829-0915`.
- Numerieke regressietest: oude camera-ray richting verschilt aantoonbaar van actieve-punt→vizier-richting.
- Exacte horizontale afstand blijft wiskundig exact.
- Verticale component van de horizontale eindpositie blijft gelijk aan het vertrekpunt.

## Eerstvolgende fysieke test
**AR-IN**: test nu eerst Horizontaal + exacte afstand op korte afstanden (50/100/250 cm) en daarna 5,20 m indien mogelijk. Test daarna Vrij, Verticaal, Op oppervlak, Parallel, Loodrecht en Eigen hoek met exacte afstand.

Zie `TESTING.md` voor de vaste testprocedure en `ROADMAP.md` voor het verdere stappenplan.

---

## Basis waarop deze bugfix voortbouwt
## Doel
Een opgeslagen project later opnieuw aan de echte fysieke omgeving koppelen. Omdat WebXR-sessies een nieuw lokaal coördinatenstelsel krijgen, gebruikt v0.8.21 een combinatie van opgeslagen locatie-informatie en door de gebruiker gekozen referentiepunten.

## Nieuw in v0.8.21
- Gebruiker kiest zelf 0, 1, 2, 3 of 4+ referentiepunten.
- 0 punten = automatisch/grof; bedoeld als locatiehulp, niet als centimeteranker.
- 1 punt = snelle translatiecorrectie.
- 2 punten = positie + richting.
- 3 punten = volledige 3D-basis uit drie niet-collineaire punten.
- 4+ punten = best-fit rigid transform met redundante controle.
- Referentiepunten zijn bestaande Measure AR-punten met naam en beschrijving.
- GPS-locatie kan per project worden opgeslagen met browser high-accuracy geolocation en accuracy metadata.
- Referentiepunten en geo-info worden mee opgeslagen in `.measurear.json` en lokale projectopslag.
- Heruitlijning toont gemiddelde, maximale en RMS-afwijking.
- Kwaliteitslabels: zeer goed / goed / matig / zwak.
- Volledige projectgeometrie wordt als één rigid transform verplaatst; onderlinge maten blijven behouden.
- Na toepassing worden afgeleide meshes opnieuw uit brondata opgebouwd.
- Projectreferenties worden bij import gevalideerd op bestaande punt-ID's.

## Belangrijke beperking
0 referentiepunten geeft in deze webapp geen echte Google VPS/Geospatial centimeterpositionering. Chrome/WebXR exposeert die ARCore Geospatial-functionaliteit momenteel niet rechtstreeks. GPS wordt daarom gebruikt als grove locatiehulp. Voor betrouwbare lokale uitlijning zijn 2, 3 of meer fysieke referenties de aanbevolen methode.

## Automatische tests na genereren — PASS
- JavaScript-syntax van alle modules.
- Named imports/exports.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben handlers.
- `relocalization.js` aanwezig.
- Modi 0/1/2/3/4+ aanwezig.
- 1-punts solver aanwezig.
- 2-punts solver aanwezig.
- 3-punts solver aanwezig.
- 4+ best-fit solver aanwezig.
- Residual/kwaliteitberekening aanwezig.
- Browser geolocation-provider aanwezig.
- Referenties + geo worden persistent opgeslagen.
- Projectimport valideert referentiepunt-ID's.
- Referentiebeheer- en heruitlijnpagina gekoppeld.
- Pure regressietest translatie-invariant PASS.
- Afstanden blijven onder rigid translation identiek.
- Centroidtranslatie PASS.
- Niet-collineariteitstest voor 3-puntsbasis PASS.

## Nieuwe fysieke tests v0.8.21
- Sla project op met GPS-locatie; controleer accuracy-weergave.
- Maak 1 projectreferentie uit bestaand punt A.
- Maak 2 referenties A/B en registreer hun echte herkenbare locaties.
- Maak 3 niet-collineaire referenties.
- Maak 4+ referenties.
- Sluit AR volledig en start een nieuwe sessie.
- Open project opnieuw.
- 1 punt: wijs A opnieuw aan en controleer translatie.
- 2 punten: wijs A/B opnieuw aan; controleer positie én richting.
- 3 punten: wijs A/B/C opnieuw aan; controleer volledige 3D-uitlijning.
- 4+ punten: controleer best-fit en residuals per set.
- Wijs expres één verkeerd referentiepunt aan en controleer dat max/mean fout verslechtert.
- Controleer dat alle afstanden in project vóór/na uitlijning identiek blijven.
- Controleer muren, vormen en openingen na transform.
- Undo/Redo en project save na heruitlijning.
- Exporteer project met referenties en importeer opnieuw.
- GPS zonder referenties: controleer dat app geen centimeterprecisie claimt.
- Test project een dag/week later opnieuw op dezelfde locatie.

## Gepland — uitgebreide functie Meten
De huidige meetfunctie is nog niet de definitieve meetmodule en wordt later aanzienlijk uitgebreid. Minstens voorzien:
- enkele afstand;
- doorlopend meten;
- totale lengte;
- horizontale en verticale afstand;
- hoogteverschil;
- hoek en helling;
- oppervlakte en omtrek;
- koppeling aan Smart Snap, referentielijnen, tekenvlakken, projectopslag en herlokalisatie;
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

### Objectbeheer — nieuw voor v0.8.21
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

### Undo/Redo — nieuw voor v0.8.21
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


Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload de volledige inhoud van deze ZIP naar GitHub. `js/relocalization.js` is nieuw en moet mee.
