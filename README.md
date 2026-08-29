# v0.8.23 Spatial Restore

Project Space blijft de geometrische waarheid. Bij het openen van een opgeslagen project met referentiepunten start nu automatisch de positieherstel-flow. De gebruiker wijst dezelfde fysieke referenties opnieuw aan; Measure AR berekent daaruit de transformatie van het permanente Project Origin naar de nieuwe WebXR-sessie. 4+ referenties gebruiken best-fit en residualcontrole.

# Measure AR v0.8.21.6 — Project Manager Stability
Build: 20260829-1305

## Doel van deze upgrade
Deze versie stabiliseert het volledige projectbeheer. De AR-tekenengine en World Lock worden bewust niet functioneel uitgebreid.

## Nieuw in v0.8.21.6
- **Kopiëren zonder projectwissel:** een opgeslagen project wordt rechtstreeks uit storage gekopieerd; het bronproject wordt niet eerst geopend.
- **Veilig wissen:** na wissen blijft `Mijn projecten` geopend. Een niet-actief project wissen verandert de huidige scène niet.
- **Actief project wissen zonder werkverlies:** de geopende geometrie blijft bestaan als `Niet-opgeslagen kopie van ...`, krijgt een nieuwe ID en recovery.
- `lastProjectId` en recovery die naar een gewist project verwijzen worden opgeschoond.
- **Veilige startup:** het laatst opgeslagen project wordt pas volledig geladen wanneer de AR-scène klaar is; alleen metadata wordt nooit meer als actief project gezet.
- Een bestaande recovery wordt bij startup niet stilzwijgend gewist door last-project autoload.
- Project load/new onderdrukt foutieve dirty/recovery-events tijdens interne history-reset.
- **Save As transactioneel:** actieve project-ID verandert pas nadat lokale opslag geslaagd is.
- Projectindex wordt bij startup herbouwd uit werkelijk aanwezige valide projecten.
- Import valideert het project, voorkomt lokale ID-conflicten en registreert de import als lokaal project.
- Duidelijke foutmelding wanneer browseropslag vol is of niet geschreven kan worden.
- Bij openen van een ander project waarschuwt de UI eerst voor niet-opgeslagen wijzigingen.

Vaste app-link: https://gasvdv-lab.github.io/Measure_tool/

## AUTO teststatus v0.8.21.6
Zie `TEST_RESULTS_v0.8.21.6.md`. De releasecontrole omvat syntax/imports/cache-key plus gerichte broninvarianten voor save/open/copy/delete/recovery/import.

## Praktijktest projectbeheer
1. Sla Project A en Project B op.
2. Open A en controleer de geometrie.
3. Maak een kopie van B terwijl A actief blijft; A mag niet veranderen.
4. Wis een niet-actief project; `Mijn projecten` moet open blijven.
5. Wis het actieve project; de geometrie moet blijven staan als niet-opgeslagen kopie.
6. Sla die kopie opnieuw op en controleer dat een nieuw project ontstaat.
7. Herstart de browser/app en controleer last-project + recovery gedrag.
8. Test export/import met punten, lijnen, vorm, muur en opening.

## Behouden uit v0.8.21.3
- Nieuwe module `js/world-lock.js`.
- WebXR-sessie vraagt `anchors` als **optionele** feature; ontbreken van anchors blokkeert de app niet.
- Elk nieuw definitief Measure AR-punt wordt tijdens de actieve XR-sessie gekoppeld aan een WebXR Anchor wanneer de browser/ARCore dit ondersteunt.
- Project/source-coördinaten (`point.position` / `locked`) blijven onveranderd; anchor-gecorrigeerde AR-weergave staat afzonderlijk in `point.worldPosition`.
- Puntmarkers, definitieve lijnen, lijnlabels, puntlabels en vormen renderen vanuit de actuele world-lockpositie.
- Lijnmeshes worden per frame opnieuw uit hun twee verankerde eindpunten gepositioneerd zonder de opgeslagen projectlengte te wijzigen.
- Muren worden bij relevante anchor-correcties opnieuw opgebouwd vanuit de actuele world-lockposities van hun basislijn.
- Bij verwijderen van een punt wordt zijn XR-anchor ook opgeruimd.
- Undo/Redo/projectherstel kan opnieuw anchors aanvragen voor teruggezette punten.
- Na Relocalization worden oude session-anchors ongeldig gemaakt en opnieuw opgebouwd op de nieuwe positie.
- In de AR-HUD verschijnt `World Lock: actief · N anchors` wanneer anchors daadwerkelijk actief zijn. Als de browser ze niet aanbiedt, verschijnt een expliciete lokale-tracking fallback.

**Architectuurregel:** projectgeometrie blijft de geometrische waarheid. XR-anchors beïnvloeden alleen de actuele AR-world pose; ze mogen opgeslagen maten niet stilletjes herschrijven.

Vaste app-link: https://gasvdv-lab.github.io/Measure_tool/

## AUTO teststatus v0.8.21.6
- JavaScript-syntax van alle modules.
- Alle relatieve ES-module-imports bestaan.
- Uniforme cache/build-key `0.8.21.6-20260829-1408`.
- WebXR `anchors` is optioneel en `hit-test` blijft required.
- Point create/delete lifecycle is gekoppeld aan World Lock queue/cleanup.
- Projectpositie en worldPosition zijn gescheiden.
- Definitieve lijnrender gebruikt beide world-lock eindpunten.
- Punt- en lijnlabels gebruiken world-lock posities.
- Muren hebben een world-lock resyncpad.
- Relocalization reset/requeue van anchors aanwezig.
- Fallbackpad blijft beschikbaar wanneer `XRFrame.createAnchor()` ontbreekt.

## GO/NO-GO fysieke test
**Eerst AR-IN/ROOM. Relocalization blijft gepauzeerd totdat dit slaagt.**

1. Start AR en controleer bovenaan of `World Lock: actief` verschijnt.
2. Plaats A en B en bevestig lijn AB volledig.
3. Houd AB in beeld en beweeg de smartphone 0,5–2 m zijwaarts, vooruit/achteruit en licht roterend.
4. AB moet op dezelfde fysieke plaats in de ruimte blijven. Alleen de schermprojectie verandert door de camerabeweging.
5. Herhaal met Horizontaal exact, Verticaal exact en Vrij.
6. Maak daarna een muur op een lijn en controleer dezelfde world-lock.
7. Meld expliciet of de HUD `World Lock: actief` of `lokale tracking` toont.

Als een bevestigde lijn ondanks **actieve anchors** nog met de telefoon meebeweegt, behandelen we dit als een diepere XR reference-space/rendering-regressie en gaan we niet verder met features.

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


## v0.8.21.6 — Project Manager UX
- Projectmanager blijft een overlay boven de actieve AR-sessie.
- Openen, Opslaan, Opslaan als, Nieuw, Importeren en Herstel sluiten de manager en keren terug naar AR.
- Wissen, Hernoemen en Kopiëren blijven in Mijn projecten.
- Mijn projecten gebruikt duidelijke kaarten met ACTIEF-status, statistieken, Openen en een compact Meer-menu.
- Zichtbare toast-feedback voor opslaan/openen/kopiëren/hernoemen/wissen.
- Permanente projectstatus in de AR-topbalk: opgeslagen of gewijzigd.
- Startscherm wordt niet gebruikt als bestemming van Project Manager-acties.

## v0.8.21.8 — Relocalization Menu Access
- `Relocalisatie` is nu rechtstreeks bereikbaar vanuit het hoofdmenu tijdens AR.
- De knop opent de bestaande pagina `Project op locatie plaatsen`.
- Geen wijziging aan de relocalisatie-engine; deze release maakt de bestaande flow bereikbaar voor de praktijktest.

## v0.8.21.8 — Relocalization UI Fix
- Gerichte fix voor de niet-reagerende Relocalisatie-knop.
- De knop gebruikt nu dezelfde generieke menunavigatie als de andere pagina's (`data-page="relocalize"`).
- Geen wijziging aan de relocalisatie-engine.

## v0.8.22 — Project Coordinate System & Spatial Save
- Project opslaan bewaart nu naast geometrie ook een expliciete `spatial` projectlaag.
- `projectOrigin` wordt als vaste projectbasis opgeslagen.
- De laatst beschikbare AR-world/camerapose en opslagtijd worden als ruimtelijke metadata bewaard.
- GPS en projectreferenties blijven onderdeel van hetzelfde projectbestand.
- Bij opnieuw openen worden projectgeometrie, project-origin, ruimtelijke metadata, GPS en referenties samen hersteld.
- Belangrijk: WebXR maakt bij een nieuwe sessie een nieuwe trackingruimte. Spatial Save bewaart dus waar het project hoort; automatische centimeternauwkeurige herkenning van die plek vereist nog relocalisatie/visuele/geospatiale ondersteuning. Referentiepunten blijven de precisie-fallback.

### v0.8.22 hotfix — Nieuw project blijft in AR
- Nieuw project aanmaken sluit alleen de Project Manager en keert expliciet terug naar de actieve AR-camera.
- De AR-sessie wordt niet beëindigd of naar het startscherm gestuurd.
- Cache-key vernieuwd zodat GitHub Pages de fix direct laadt.

### v0.8.22 patch — Nieuw project blijft in camera
Bij het starten van een nieuw project worden World Lock-koppelingen veilig losgemaakt zonder de actieve WebXR-sessie te beheren. De Project Manager sluit en de gebruiker keert terug naar het AR-beeld, niet naar het startscherm.

## v0.8.24 — World Lock 2.0
- Surface-confirmed points now retain the live `XRHitTestResult` and prefer `XRHitTestResult.createAnchor()` so the anchor is attached directly to the detected real-world surface.
- Computed/exact-distance points retain the `XRFrame.createAnchor()` fallback in the active local reference space.
- Stored project geometry remains the source of truth; anchors only control the session-local visible world pose.
- Current physical gate: a committed A→B line must remain fixed while the phone moves 0.5–2 m.


### v0.8.24 hotfix — Shape Fill
- Een gesloten vorm wordt nu onmiddellijk als vorm aangemaakt en opgevuld.
- De bestaande kleur, transparantie, randdikte en labels worden gebruikt.
- De opvulling blijft gekoppeld aan de world-locked hoekpunten.


## v0.8.25 — Spatial Restore 2.0
- Spatial Restore is opnieuw de actieve roadmapstap na de geslaagde World Lock 2.0-regressietest.
- Project Origin wordt bij opslaan automatisch afgeleid van de eerste projectreferentie; zonder referentie wordt het eerste projectpunt gebruikt.
- Bij openen van een opgeslagen project met referenties start positieherstel automatisch in de aanbevolen 1/2/3/4+ methode.
- De gekozen methode vereist nu effectief het juiste minimumaantal opnieuw aangewezen referenties.
- Referentienaam en omschrijving worden samen getoond zodat het fysieke punt herkenbaar is.
- Resultaat toont RMS, gemiddelde en maximale afwijking. Een zwakke oplossing geeft een waarschuwing vóór toepassen.
- Na een rigid Spatial Restore worden Project Origin en opgeslagen referentiecoördinaten mee getransformeerd zodat een volgende save/reopen geen gemengde coördinatenframes bevat. Lengtes en hoeken blijven ongewijzigd.
- World Lock 2.0 en de shape-fill hotfix uit v0.8.24 blijven behouden.

### Praktijktest v0.8.25
Maak een project met 4 herkenbare punten, registreer ze als referenties en sla op. Sluit AR volledig, open opnieuw, open het project, wijs dezelfde 4 fysieke punten opnieuw aan, bereken de uitlijning en pas ze toe. Controleer dat geometrie terug op dezelfde plaats komt, World Lock actief blijft en alle afmetingen identiek blijven.
