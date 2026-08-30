# v0.8.32.1 — Horizontal Axis Lock

## Automatisch uitgevoerd
- [x] JavaScript-syntaxcontrole op alle JS-bestanden.
- [x] Alle interne ES-module imports gebruiken één build-ID `0.8.32.1-20260830-horizontal-axis-lock`.
- [x] Nieuwe constraint `axis` is opgenomen in richtingselectie, kandidaatberekening en constraint-validatie.
- [x] ZIP-integriteit en vereiste documentatie gecontroleerd.

## Fysiek op Android/Chrome/WebXR — uitvoeren
- [ ] AR start en surface-detectie blijft normaal werken.
- [ ] Lijn → punt A → **Horizontaal · vrij** werkt zoals in v0.8.32.
- [ ] Lijn → punt A → **Horizontaal · asvast** houdt de preview exact langs één horizontale hoofdas.
- [ ] Bij diagonaal bewegen schakelt de richting voorspelbaar tussen X- en Z-as.
- [ ] Exacte afstand + Asvast behoudt exact de ingevoerde mm/cm/m-afstand.
- [ ] Polyline kan meerdere asvaste segmenten maken.
- [ ] Smart Snap trekt een asvaste kandidaat niet naar een punt dat buiten de as ligt.
- [ ] Vrij / Verticaal / Op oppervlak / Parallel / Loodrecht / Eigen hoek vertonen geen regressie.

---

# v0.8.32 — aanvullende tests

- **AUTO:** JavaScript-syntax, interne module-imports, één gedeelde build-ID en ZIP-integriteit.
- **AR-IN/ROOM:** Doorlopende lijn A→B→C tekenen en voltooien; totale lengte en hoek B controleren.
- **AR-IN/ROOM:** A→B→C→D; segmenten, totaal en twee tussenhoeken controleren.
- **AR-IN/ROOM:** mm/cm/m wisselen zonder geometriewijziging.
- **AR-IN/ROOM:** Undo/Redo en project save/reopen.
- **AR-IN/ROOM regressie:** gewone punt→punt→lijnmeting blijft werken.

---

# v0.8.31 — Measure Select & Edit + mm

## Automatisch uitgevoerd
- [x] JavaScript-syntaxcontrole op alle JS-bestanden.
- [x] Alle interne ES-module imports gebruiken exact build-ID `0.8.31-20260830-measure-select-edit-mm`.
- [x] mm toegevoegd aan individuele meeteenheid, standaardeenheid en exacte-afstand-HUD.
- [x] Interne afstand blijft meter; mm-conversie gebruikt 1 m = 1000 mm.
- [x] README.md, ROADMAP.md, TESTING.md en MODULES.md aanwezig.

## Fysiek op Android/Chrome/WebXR — uitvoeren
- [ ] AR start en surface-detectie blijft werken.
- [ ] Punt A → punt B → lijn blijft correct meten.
- [ ] ☰ → Metingen → bestaande meting selecteren.
- [ ] Naam wijzigen en opslaan.
- [ ] Eenheid mm → cm → m wisselen; geometrie blijft exact dezelfde lengte.
- [ ] Eenheid mm toont een passend millimeterlabel.
- [ ] Kleur/dikte wijzigen.
- [ ] Lijnzichtbaarheid en maatlabelzichtbaarheid afzonderlijk aan/uit.
- [ ] Instellingen → standaard mm → nieuwe lijn krijgt mm als weergave-eenheid.
- [ ] Exacte afstand in HUD met mm invoeren en controleren.
- [ ] Undo/Redo herstelt de bewerkte meeteigenschappen.
- [ ] Project opslaan → heropenen bewaart mm/cm/m en overige meeteigenschappen.
- [ ] Polyline/vorm/muurfuncties vertonen geen regressie.

## Bevestigd uit v0.8.30
- [x] AR-ANDROID: lijnmeting is fysiek getest en werkt correct.

---

# v0.8.30 — Measure Engine Foundation

## Automatisch uitgevoerd
- [x] JavaScript-syntaxcontrole op alle JS-bestanden.
- [x] Alle interne ES-module imports gebruiken exact build-ID `0.8.31-20260830-measure-select-edit-mm`.
- [x] Nieuwe DOM-elementen voor Metingen en lijn-eigenschappen aanwezig.
- [x] README.md, ROADMAP.md, TESTING.md en MODULES.md aanwezig.

## Fysiek op Android/Chrome/WebXR — uitvoeren
- [ ] AR start en surface-detectie blijft werken.
- [ ] Lijn: punt A → punt B → lijn zonder fout.
- [ ] Maatlabel verschijnt direct bij de lijn.
- [ ] ☰ → Metingen toont de nieuwe lijn met correcte afstand.
- [ ] Meting openen → naam wijzigen → opslaan.
- [ ] Eenheid wijzigen cm ↔ m; label en meetlijst volgen de gekozen eenheid.
- [ ] Lijn tonen uitzetten verbergt alleen de lijn; opnieuw aanzetten herstelt ze.
- [ ] Maatlabel tonen uitzetten verbergt alleen het label.
- [ ] Kleur en dikte wijzigen blijven werken.
- [ ] Undo/Redo herstelt meeteigenschappen correct.
- [ ] Project opslaan → heropenen: eenheid, zichtbaarheid, naam, kleur, dikte en labelstatus blijven behouden.
- [ ] Bestaande polyline/vorm/muurfuncties vertonen geen regressie.

## Bevestigd uit v0.8.29.1.3
- [x] AR-ANDROID: surface hit → eerste punt → tweede punt → lijn werkt.
- [x] `Cannot read properties of null (reading 'Group')` treedt niet meer op in deze basistest.

## Nog open uit eerdere versies
- [ ] `Project op locatie plaatsen` / reference-capture praktisch herstellen en valideren.
- [ ] CAD-placementpraktijktests worden bewust uitgesteld zolang CAD geparkeerd is.
- [ ] Definitieve lijnlabel-oriëntatie later opnieuw testen/ontwerpen.

---

# v0.8.29.1.3 — State Fix

## Nieuwe regressietest
1. Open AR op Android/Chrome.
2. Bevestig dat surface diagnostic een geldige target toont.
3. Kies Lijn en plaats punt 1.
   - Geslaagd: punt verschijnt; geen `Cannot read properties of null (reading 'Group')`.
4. Plaats punt 2.
   - Geslaagd: lijn verschijnt tussen beide punten.
5. Verlaat AR en open opnieuw.
   - Geslaagd: sessie start opnieuw zonder state-fout.
6. Test bestaand project openen, nieuw project maken en CAD-import als regressie.

# v0.8.29.1.2 — XR Surface Diagnostic

- [ ] AR-IN: richt op goed verlichte vloer/tafel en noteer exact de regel `XR ...`.
- [ ] Beweeg 10–20 seconden langzaam; noteer of `Hits` ooit groter dan 0 wordt.
- [ ] Als Hits > 0: noteer Pose en Target.

# Measure AR TESTING

## v0.8.29.1 — CAD Preview
- [x] AUTO: JavaScript syntaxcontrole.
- [x] AUTO: relatieve module-imports bestaan.
- [x] AUTO: release bevat geen TEST_RESULTS-bestanden.
- [ ] PC/ANDROID: GLB kiezen → preview zichtbaar.
- [ ] PC/ANDROID: orbit/zoom + 3D/boven/voor.
- [ ] PC/ANDROID: afmetingen vergelijken met bronmodel.
- [ ] AR-ANDROID: Model gebruiken → terug naar AR → 1:1 plaatsing.
- [ ] AR-ANDROID: bestaand project/geometrie blijft behouden tijdens previewflow.
- [ ] OPEN: Project op locatie plaatsen / reference-capturebug blijft geparkeerd.

# Testing — Measure AR

## v0.8.29.0 — AI Builder Prototype

### Automatisch uitgevoerd
- [x] JavaScript syntaxcontrole op alle JS-bestanden.
- [x] Lokale ES-module imports bestaan.
- [x] Geen dubbele HTML-id's.
- [x] Release bevat README.md, ROADMAP.md, TESTING.md en MODULES.md.
- [x] Geen TEST_RESULTS-bestanden in release.
- [x] Versie/cachetags naar v0.8.29.0 bijgewerkt.

### Fysiek op Android/Chrome/WebXR — nog uitvoeren
- [ ] Bestaande basisfuncties starten zonder regressie.
- [ ] Teken horizontale vorm en sla ze op.
- [ ] Open vorm → AI Builder prototype.
- [ ] `Maak hier een houten kist van 50 cm hoog` geeft conceptvolume op exacte footprint.
- [ ] `Maak hem 80 cm hoog` wijzigt hetzelfde object.
- [ ] `Maak hem 20 cm hoger` werkt relatief.
- [ ] Vastgezet concept weigert tekstwijziging.
- [ ] Ontgrendelen laat wijziging opnieuw toe.
- [ ] Undo/redo werkt voor maken, aanpassen, lock en verwijderen.
- [ ] Project opslaan → app/project opnieuw openen → AI-concept herstelt.
- [ ] Verticale vorm wordt veilig geweigerd door prototype in plaats van foutieve geometrie te maken.
- [ ] CAD import/placement blijft werken.
- [ ] Project op locatie plaatsen/reference capture: bekende open bug opnieuw controleren, niet als opgelost beschouwen.

---

## v0.8.28.10 — Theme Selector

**Automatische controles**
- Alle JavaScript syntactisch geldig.
- Alle lokale module-imports bestaan.
- Geen dubbele HTML-ID’s.
- Exact vijf geldige thema-keuzes aanwezig.
- Thema-opslag gebruikt uitsluitend lokale UI-state en wijzigt geen projectgeometrie.
- Professional Color Picker blijft aanwezig.

**Fysieke tests nog uit te voeren**
- Elk van de vijf thema’s kiezen in Android Chrome en controleren dat de keuze direct zichtbaar is.
- App vernieuwen en controleren dat het gekozen thema behouden blijft.
- Menu, HUD, popovers en colorpicker controleren binnen ieder thema.
- CAD-importpagina openen en controleren dat hetzelfde thema wordt gebruikt.
- Bestaande AR-teken- en projecttests blijven open waar nog niet fysiek uitgevoerd.

# v0.8.28.10 — Professional Color Picker

## Automatische controles
- [x] JavaScript-syntaxcontrole.
- [x] Alle lokale ES-module imports bestaan.
- [x] Geen dubbele DOM-id's.
- [x] Alle 8 bestaande kleurvelden worden door de gedeelde picker gedetecteerd.
- [x] Geen externe colorpicker-library toegevoegd.
- [x] Geen `TEST_RESULTS`-bestand in release.

## Praktijktest — Android
- [ ] Lijn → Kleur opent de nieuwe picker, niet de native browserpicker.
- [ ] Snelle themakleur kiezen → Lijn opslaan → lijn krijgt exact die kleur.
- [ ] Meer kleuren → kleurvlak + hue-slider reageren vloeiend.
- [ ] HEX invoeren en toepassen werkt.
- [ ] RGB invoeren en toepassen werkt.
- [ ] Annuleren bewaart de oorspronkelijke kleur.
- [ ] Recent gebruikt toont eerder toegepaste kleuren.
- [ ] Muur tekenen, Muur maken en Muur bewerken gebruiken dezelfde picker.
- [ ] Vorm opvulling en Rand gebruiken onafhankelijk dezelfde picker.
- [ ] Bestaande project-, teken- en CAD-flow vertonen geen regressie.
- [ ] Bestaande openstaande AR/CAD-tests uit eerdere versies blijven uit te voeren.

# v0.8.28.8 — AR HUD Refinement

## v0.8.28.8 tests

**Automatisch:** JS-syntax/imports, HTML-ID's, ZIP-structuur en regressiecontrole. **Fysiek nog uit te voeren:** lijn tekenen, vizier/maatlabels in AR, leesbaarheid buiten, CAD-plaatsing bij voldoende licht. Bestaande niet-uitgevoerde fysieke tests blijven van kracht.


## Automatische controles
- [x] JavaScript-modules byte-identiek aan v0.8.28.6.
- [x] HTML gebruikt bestaande DOM-id's; geen functionele eventtargets verwijderd.
- [x] CSS-only HUD-refinement.
- [x] Geen TEST_RESULTS-bestand in release.

## Praktijktests — nog uitvoeren
- [ ] AR: vizier is nauwkeurig zichtbaar zonder het doelpunt te bedekken.
- [ ] AR: hit-status groen en snap-status blauw duidelijk genoeg in buitenlicht.
- [ ] Lijn tekenen: HUD/contextbalk belemmert het zicht niet.
- [ ] Lijn tekenen: Undo, Redo, Voltooien en Stop blijven goed bedienbaar.
- [ ] Maatlabels zijn leesbaar maar minder dominant.
- [ ] Kleine puntlabels blijven herkenbaar op verschillende achtergronden.
- [ ] Bestaand project openen en nieuwe lijn tekenen werkt identiek aan v0.8.28.6.
- [ ] CAD-import via aparte cad-import.html blijft identiek werken.

# v0.8.28.6 — Professional UI Pass

## AUTO
- [x] Alle JavaScript-bestanden slagen voor syntaxcontrole.
- [x] Alle lokale ES-module imports bestaan.
- [x] JavaScript-modules zijn byte-for-byte gelijk aan v0.8.28.5.
- [x] Geen dubbele DOM-id's in `index.html` of `cad-import.html`.
- [x] Release bevat geen `TEST_RESULTS`-bestand.

## ANDROID / AR — UI praktijktest
- [ ] Start AR: topbalk en menu blokkeren het camerabeeld niet onnodig.
- [ ] Open hoofdmenu: bottom sheet is compact, scrollbaar en alle bestaande menuacties blijven bereikbaar.
- [ ] Start Lijn: vizier is duidelijk maar merkbaar kleiner en nauwkeuriger dan in v0.8.28.5.
- [ ] Bevestigingsknop blijft makkelijk aan te tikken en krijgt een duidelijke actieve toestand bij geldige plaatsing.
- [ ] Teken een lijn: HUD, afstand, puntlabels en lijnlabels zijn goed leesbaar zonder het doelgebied te domineren.
- [ ] Undo/Redo/Voltooien/Stop blijven functioneel.
- [ ] Project openen/opslaan blijft functioneel.
- [ ] CAD → importeren blijft via de aparte `cad-import.html`-pagina lopen.
- [ ] CAD-plaatsing wordt later bij voldoende licht hervat.
- [ ] Openstaande referentie-capturebug afzonderlijk behouden; deze UI-release claimt daar geen fix voor.

# v0.8.28.5 gerichte regressietest — externe CAD-importpagina

- [ ] AR: CAD importeren navigeert naar `cad-import.html`.
- [ ] `cad-import.html` bevat geen WebXR/canvas/AR-overlay.
- [ ] Android file picker kiezen → na terugkeer blijven Bestand kiezen, Terug en Annuleren klikbaar.
- [ ] Na succesvolle import werkt `Terug naar Measure AR`.
- [ ] Verse `index.html` toont `AR starten en CAD plaatsen`.
- [ ] Na die tik start AR en wordt het geïmporteerde model in plaatsingsmodus geladen.
- [ ] Bestaande projectgeometrie blijft behouden via recovery.
- [ ] Annuleren verwijdert pending-CAD status en keert normaal terug.

# v0.8.28.5 tests

Automatisch: JS-syntax, lokale module-imports, unieke DOM-id's.

Praktijktest: actief project → CAD → CAD-model importeren → AR moet eerst stoppen en de normale CAD-importworkspace tonen → Bestand kiezen → na terugkeer moeten alle workspaceknoppen bruikbaar blijven → AR starten en CAD plaatsen → AR opent opnieuw en model kan geplaatst worden. Annuleren van de Android-bestandskiezer mag de workspace niet blokkeren. Bestaand project en geometrie moeten behouden blijven.

# v0.8.28.5 gerichte regressietest — CAD AR hervatten

1. Open een bestaand of nieuw project in AR.
2. Open **CAD / 3D-model** en importeer een GLB.
3. Controleer dat je niet naar Home gaat.
4. Tik **AR hervatten en CAD plaatsen**. PASS: knop toont kort **AR wordt hervat…** en de AR-camera keert terug.
5. PASS: het CAD-model wordt opnieuw geladen en volgt het vizier zodra een hit-test beschikbaar is.
6. Open CAD-menu en bevestig **Plaats CAD hier**. PASS: model blijft op de gekozen positie.
7. Bij een WebXR-fout: PASS als foutmelding zichtbaar is en CAD-context actief blijft; Home mag niet verschijnen.

# v0.8.28.5 gerichte regressietest — CAD Home-block

**Kritieke test:** Open actief project → ☰ → CAD → CAD-model importeren → open Android-bestandskiezer → kies GLB. Op geen enkel moment mag het Measure AR-startscherm verschijnen. Bij XR-onderbreking moet CAD-menu/context zichtbaar blijven. Test ook annuleren van de bestandskiezer.

# v0.8.28.5 gerichte regressietest — CAD file picker lifecycle

## AUTO
- [x] Alle JS-bestanden syntax geldig.
- [x] Alle lokale ES-module imports bestaan.
- [x] Release bevat geen TEST_RESULTS-bestand.

## AR-ANDROID — verplicht
1. Open een bestaand project met minstens één zichtbare lijn of vorm.
2. Open ☰ → CAD / 3D-model → CAD-model importeren.
3. Open Androids bestandskiezer. **PASS:** na terugkeer verschijnt niet het Measure AR-startscherm.
4. Selecteer een GLB. **PASS:** CAD-scherm blijft actief en meldt dat het model geladen is wanneer XR onderbroken werd.
5. Kies **AR hervatten en CAD plaatsen**. **PASS:** camera/AR keert terug en model volgt het vizier.
6. Plaats en bevestig CAD. **PASS:** bestaand project en eerdere geometrie zijn nog aanwezig.
7. Herhaal en annuleer de bestandskiezer. **PASS:** geen navigatie naar Home/startscherm en geen projectverlies.

## Bekend openstaand
- Project op locatie plaatsen / referentie-capture blijft nog apart open.

# v0.8.28 gerichte test

## CAD-1
- AUTO: alle JS-bestanden syntax geldig.
- AUTO: alle lokale ES-module imports bestaan.
- PC: GLB-filepicker en CAD-menu zichtbaar.
- AR-IN/ROOM of AR-OUT: GLB importeren, vizierplaatsing, rotatie ±5°, hoogte ±1 cm, bevestigen, 1:1 afmetingen visueel controleren.
- AR: project opslaan, AR volledig sluiten, opnieuw openen en controleren dat CAD via IndexedDB terugkomt.

## Bekend openstaand
- Project op locatie plaatsen / referentie-capture is nog niet opgelost en blokkeert de CAD-1 test niet.

# v0.8.27.1 gerichte test
1. World Lock: teken lijn/vorm en loop rond.
2. Shape Fill: sluit vorm; fill moet direct zichtbaar zijn.
3. Registreer 2-4 refs, save, sluit tab/AR volledig, open opnieuw.
4. Gebruik vizier voor refs; menu moet weg zijn tijdens mikken.
5. Gekozen 4+ modus mag niet berekenen met minder dan 4 captures.
6. Apply restore; afmetingen moeten exact gelijk blijven.
7. Teken na restore een nieuwe lijn; deze moet correct aansluiten en opslaan.
8. Save/reopen/restore opnieuw; geen cumulatieve verschuiving van brongeometrie.

# v0.8.23 Spatial Restore

Project Space blijft de geometrische waarheid. Bij het openen van een opgeslagen project met referentiepunten start nu automatisch de positieherstel-flow. De gebruiker wijst dezelfde fysieke referenties opnieuw aan; Measure AR berekent daaruit de transformatie van het permanente Project Origin naar de nieuwe WebXR-sessie. 4+ referenties gebruiken best-fit en residualcontrole.

# Measure AR — TESTING

## Huidige verplichte gate — v0.8.21.6 Project Manager Stability
- `AR-IN`: twee projecten opslaan en kruislings openen.
- `AR-IN`: project kopiëren zonder actieve scène te wijzigen.
- `AR-IN`: niet-actief en actief project wissen.
- `AR-IN`: browser/app herstart met last-project en met recovery.
- `AR-IN`: export/import roundtrip.
- World Lock basis is tijdens de huidige praktijktest positief: eenvoudige lijn en samengestelde geometrie blijven op hun fysieke positie.

# TESTING.md — Measure AR

## Testcodes
- **AUTO** — automatische/statische tests per build.
- **PC** — laptop/browser zonder echte AR.
- **AR-IN/A4** — smartphone binnen op A4-testbench.
- **AR-IN/ROOM** — smartphone binnen op meterschaal.
- **AR-OUT** — smartphone buiten voor terrein/GPS/nauwkeurigheid.

## Huidige verplichte gate — v0.8.21.6 Shape Closure + World Lock
Voer deze test **eerst** uit. Stop bij een fout en ga niet verder met Relocalization.

1. Start een volledig nieuwe AR-sessie.
2. Controleer de HUD:
   - voorkeur: `World Lock: actief · ... anchors`;
   - noteer expliciet wanneer `World Lock: lokale tracking` verschijnt.
3. Teken A→B en bevestig B.
4. Beweeg daarna de smartphone 0,5–2 m zijwaarts, vooruit/achteruit en draai rond AB.
5. **PASS:** AB blijft gekoppeld aan dezelfde fysieke plaats in de kamer.
6. **FAIL:** AB blijft ongeveer op dezelfde schermpositie of schuift zichtbaar mee met de telefoon/wereld.
7. Herhaal met:
   - Vrij;
   - Horizontaal + exacte afstand;
   - Verticaal + exacte afstand omhoog;
   - Verticaal + exacte afstand omlaag.
8. Maak een muur op een bevestigde lijn en beweeg opnieuw rond het object.
9. Undo → Redo → herhaal de world-lockcontrole.

## Constraint-regressie na World Lock PASS
1. Horizontaal exact: 0,50 / 1,00 / 2,50 m.
2. Verticaal exact: omhoog/omlaag.
3. Verticaal AUTO.
4. Op oppervlak exact/AUTO.
5. Parallel exact/AUTO, beide richtingen.
6. Loodrecht exact/AUTO, links/rechts.
7. Eigen hoek 30°/45°/90° exact/AUTO.
8. Vrij exact/AUTO.
9. Muur maken → Objecten → Muren → wissen.
10. Undo/Redo; objectlijst en scène blijven synchroon.

## Permanente volgorde per upgrade
1. AUTO
2. PC indien relevant
3. AR-IN/A4
4. AR-IN/ROOM wanneer tracking/schaal relevant is
5. AR-OUT alleen wanneer terrein/GPS/buitennauwkeurigheid relevant is

Niet-uitgevoerde fysieke tests blijven open en worden naar volgende versies meegenomen.

## A4-testbench
Een gestandaardiseerd afdrukbaar testblad blijft gepland. Afdrukken op 100% schaal, nooit 'passen aan pagina'.


## v0.8.21.6 — Project Manager UX
- Projectmanager blijft een overlay boven de actieve AR-sessie.
- Openen, Opslaan, Opslaan als, Nieuw, Importeren en Herstel sluiten de manager en keren terug naar AR.
- Wissen, Hernoemen en Kopiëren blijven in Mijn projecten.
- Mijn projecten gebruikt duidelijke kaarten met ACTIEF-status, statistieken, Openen en een compact Meer-menu.
- Zichtbare toast-feedback voor opslaan/openen/kopiëren/hernoemen/wissen.
- Permanente projectstatus in de AR-topbalk: opgeslagen of gewijzigd.
- Startscherm wordt niet gebruikt als bestemming van Project Manager-acties.

## v0.8.21.8 — Relocalisatie toegang
AR-IN/ROOM: open een opgeslagen project en controleer dat `☰ → Relocalisatie` rechtstreeks beschikbaar is. Voer daarna de referentiepunt-flow uit.

### v0.8.22 hotfix test
AR-IN: Start AR → Project → Nieuw leeg project → bevestigen. Verwacht: Project Manager sluit en camera blijft actief; startscherm verschijnt niet.

## v0.8.24 World Lock 2.0 gate
AR-IN/ROOM: place A→B on a stable surface, confirm both endpoints, then move the phone 0.5–2 m. The committed geometry must remain fixed relative to the environment. If it moves with the phone, stop further Spatial Restore testing.


## v0.8.26 — gerichte fysieke test
1. Sla bij Project de **Hybride locatie** op. Controleer GPS-nauwkeurigheid en eventueel richting.
2. Sluit de AR-sessie volledig en start opnieuw op dezelfde locatie.
3. Open het project en kies **Hybride locatie controleren**. De afstand moet logisch zijn en de GPS-onzekerheid zichtbaar.
4. Kies een opgeslagen referentie en druk **Gebruik vizier**. Het menu moet sluiten.
5. Richt het vizier op het fysieke punt en druk de witte knop. Het relocalisatiescherm moet terugkomen met een vinkje.
6. Herhaal minstens twee referenties en bereken/apply de uitlijning.
7. Controleer dat bestaande geometrie na toepassing world-locked blijft en afmetingen niet veranderen.

## Extra regressies v0.8.27.1
1. Project op locatie plaatsen → Gebruik vizier: witte knop moet actief worden zodra een geldige hit aanwezig is.
2. Open project B nadat project A uitgelijnd is: B mag geen transform/positie van A erven.
3. Wissel meerdere keren van project: geen oude anchors of plotselinge terug-sprongen.
4. Wijzig lijnkleur/dikte na relocalisatie: lijn blijft op dezelfde zichtbare positie.