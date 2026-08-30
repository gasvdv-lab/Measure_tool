# v0.8.36.1 — World Lock Position Repair

Onderhoudsrelease op v0.8.36. Herstelt de WebXR-anchorroute zodat één mislukte anchor niet de volledige sessie naar lokale tracking terugzet en surface hit-anchors niet onterecht afhankelijk zijn van `XRFrame.createAnchor()`. Geen nieuwe meetfunctionaliteit.

# Measure AR v0.8.36 — Clearance & Collision 2.0

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

Deze release bouwt rechtstreeks verder op v0.8.35 en maakt vrije-ruimtecontrole objectgericht.

## Nieuw in v0.8.36
- Nieuwe pagina **Metingen → Vrije ruimte / collision**.
- Kies twee ruimtelijke objecten: muur, vorm, AI-object of geplaatst CAD-model.
- Deterministische 3D-bounding-boxanalyse berekent de kortste vrije ruimte tussen beide objecten.
- Collision wordt gemeld wanneer de 3D-begrenzingen elkaar overlappen.
- Stel een minimale vrije ruimte in en krijg **✓ voldoende** of **⚠ tekort** met marge/tekort.
- Resultaat toont ook scheiding per X/Y/Z-as.
- Vrije-ruimtecontroles worden als echte projectmeetobjecten opgeslagen en gaan mee in Undo/Redo, project save/recovery en heropenen.
- mm/cm/m worden ondersteund voor de clearancecontrole.
- De bestaande lijn-clearance uit v0.8.35 blijft beschikbaar.
- Geen wijziging aan WebXR hit-test, World Lock of de bewezen punt-/lijnplaatsing.

### Technische grens
Deze versie gebruikt **axis-aligned 3D bounding boxes (AABB)**. Dat is snel, voorspelbaar en geschikt als foundation voor “past dit hier?”, maar is nog geen exacte mesh-tegen-mesh collision engine. Bij gedraaide of sterk onregelmatige modellen kan de begrenzing dus conservatief zijn.

---


## v0.8.35 — Volume / Clearance Foundation

Deze release bouwt verder op de Measure Engine zonder de bewezen AR-placementketen te wijzigen.

- Een gesloten vorm kan nu optioneel als **volume-meting** worden gebruikt: oppervlakte × ingevoerde hoogte/diepte.
- Volume wordt deterministisch berekend uit de bestaande gemeten footprint; de geometrie wordt niet automatisch aangepast.
- Een lijnmeting kan nu optioneel als **vrije-ruimtecontrole (clearance)** worden gemarkeerd.
- Je geeft een minimale vereiste vrije maat op; Measure AR toont vervolgens **✓ marge** of **⚠ tekort**.
- Volume- en clearancegegevens worden meegenomen in project snapshots, Undo/Redo en recovery.
- De volgende stap blijft een uitgebreidere Clearance/Collision Engine met echte object-object/omgevingcontroles.
# Measure AR v0.8.35 — Height & Vertical Measurements

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

Deze release bouwt verder op v0.8.33 en breidt de Measure Engine uit met hoogte- en verticale meetinformatie.

## Nieuw in v0.8.35
- Iedere gewone lijn toont naast de 3D-lengte ook het absolute hoogteverschil (ΔH).
- Niet-verticale lijnen tonen daarnaast hun horizontale projectie.
- Een lijn die binnen 25 mm horizontale afwijking verticaal staat, wordt in **Metingen** expliciet als **hoogte** weergegeven.
- De bestaande **Verticaal**-constraint kan daardoor rechtstreeks als exacte hoogtemeting worden gebruikt.
- Hoogteweergave volgt de gekozen eenheid mm/cm/m; geometrie blijft intern in meter.
- Oppervlaktemetingen uit v0.8.33 worden in **Metingen** opgenomen met oppervlakte en omtrek.
- De ontbrekende `fmtAreaUnit`-export uit de v0.8.33-bron is hersteld, zodat de area-measurement UI correct kan laden.
- Geen wijzigingen aan WebXR hit-test, World Lock, CAD-placement of de bewezen puntplaatsing.

## Fysieke test v0.8.35
1. Maak een gewone schuine lijn en open **Metingen**: controleer 3D-lengte, ΔH en horizontale afstand.
2. Maak met **Verticaal** een lijn omhoog: **Metingen** moet deze als hoogte tonen.
3. Wissel mm/cm/m en controleer dat alleen de weergave wijzigt.
4. Maak een gesloten vorm en controleer dat deze onder **Metingen** verschijnt met oppervlakte en omtrek.
5. Test Undo/Redo en project opslaan/heropenen.
6. Regressie: gewone lijn, polyline/hoeken en Horizontaal · asvast blijven werken.

---

# Measure AR v0.8.32.1 — Horizontal Axis Lock

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

Deze onderhoudsrelease bouwt rechtstreeks verder op v0.8.32. De bewezen punt-/lijnplaatsing en Measure Engine blijven intact; alleen de horizontale richtingsconstraint wordt uitgebreid.

## Nieuw in v0.8.32.1
- **Horizontaal · vrij** behoudt het bestaande gedrag: de lijn blijft horizontaal, maar de richting volgt het vizier.
- Nieuwe keuze **Horizontaal · asvast** voor kaarsrechte orthogonale lijnen.
- Asvast kiest automatisch de dichtstbijzijnde horizontale X- of Z-hoofdrichting en vergrendelt de kandidaat daarop.
- Werkt zowel met vrije plaatsing als met een exact ingestelde afstand.
- Smart Snap mag alleen een bestaand punt hergebruiken wanneer dat punt ook aan de asconstraint voldoet.
- Geen wijzigingen aan World Lock, AR hit-test, CAD of bestaande meetberekeningen.

## Testdoel v0.8.32.1
1. Start **Lijn** en plaats punt A.
2. Kies **Horizontaal · vrij** en bevestig dat het bestaande horizontale gedrag nog werkt.
3. Start opnieuw en kies **Horizontaal · asvast**. Beweeg het vizier diagonaal: de preview moet exact langs één hoofdas blijven.
4. Richt meer naar de andere hoofdas: de preview moet naar die as overschakelen.
5. Stel bijvoorbeeld **1000 mm** exact in met Asvast en controleer dat de lijn exact 1000 mm blijft.
6. Herhaal bij een polyline A→B→C om te controleren dat elk nieuw segment asvast kan worden gezet.
7. Regressie: Vrij, Horizontaal vrij, Verticaal, Parallel, Loodrecht en Eigen hoek blijven beschikbaar.

---

# Measure AR v0.8.32 — Polyline & Angle Measurements

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

Deze release bouwt verder op v0.8.31 zonder de bewezen punt-/lijnplaatsing of World Lock-logica te wijzigen. De bestaande **Doorlopende lijn** wordt nu een expliciet meetobject.

## Nieuw in v0.8.32
- Een open polyline wordt na **Voltooien** opgeslagen als **doorlopende meting**.
- De app berekent de lengte van ieder segment én de totale trajectlengte.
- Voor ieder tussenpunt wordt de geometrische hoek tussen de twee aangrenzende segmenten berekend (0–180°; een rechte voortzetting is 180°).
- **Metingen** toont doorlopende metingen apart, zonder de segmenten dubbel bij de totale meetobjecten op te tellen.
- Een doorlopende meting kan worden geopend met segmentlengtes en hoeken per tussenpunt.
- Naam en eenheid mm/cm/m kunnen per doorlopende meting worden gewijzigd. De onderliggende geometrie blijft in meter.
- Polyline-meetmetadata wordt meegenomen in Undo/Redo en project snapshot/recovery.

## Testdoel v0.8.32
1. Teken via **Doorlopende lijn** minstens A → B → C en kies **Voltooien**.
2. Open **☰ → Metingen** en controleer de totaallengte.
3. Open de doorlopende meting en vergelijk AB, BC en de hoek bij B met de getekende situatie.
4. Teken ook A → B → C → D en controleer dat er twee hoeken worden weergegeven.
5. Wissel mm ↔ cm ↔ m; alleen de weergave mag veranderen.
6. Test Undo/Redo en project opslaan/heropenen.
7. Regressie: maak daarna één gewone lijn en controleer dat de bestaande v0.8.30/v0.8.31 lijnmeting nog correct werkt.

---

# Measure AR v0.8.31 — Measure Select & Edit + mm

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

Deze release bouwt rechtstreeks verder op de fysiek geslaagde v0.8.30 Measure Engine Foundation. De bewezen punt → punt → lijn-meetketen blijft ongemoeid.

## Nieuw in v0.8.31
- **Metingen** is nu de expliciete ingang om bestaande afstandsmetingen te selecteren en te bewerken.
- Bestaande metingen blijven bewerkbaar op naam, eenheid, kleur, dikte, lijnzichtbaarheid en maatlabelzichtbaarheid.
- **Millimeter (mm)** is toegevoegd naast cm en m.
- mm werkt zowel voor individuele meetlabels als voor de standaard meeteenheid en de exacte-afstand-HUD.
- De interne metrische geometrie blijft in meter opgeslagen; alleen invoer/weergave wordt omgerekend. Daardoor veranderen afmetingen niet bij wisselen van eenheid.
- Undo/Redo en projectopslag blijven de gekozen meeteenheid en bewerkeigenschappen bewaren.

## Stabiele gate
De gebruiker heeft v0.8.30 fysiek getest: de lijnmeting werkt correct. v0.8.30 geldt daarom als geslaagde Measure Engine Foundation-gate.

## Testdoel v0.8.31
1. Teken een lijn en controleer de gemeten lengte.
2. Open **☰ → Metingen** en selecteer de lijn.
3. Wijzig naam, kleur/dikte, zichtbaarheid en maatlabel.
4. Wissel de eenheid tussen **mm ↔ cm ↔ m** en controleer dat alleen de weergave verandert.
5. Stel **mm** als standaardeenheid in en maak een nieuwe exacte-afstandsmeting.
6. Test Undo/Redo en project opslaan/heropenen.

---

# Measure AR v0.8.30 — Measure Engine Foundation

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

Deze release start de actieve **Measure Engine**-ontwikkelfase op de fysiek bevestigde stabiele baseline v0.8.29.1.3. CAD blijft aanwezig in de app en roadmap, maar verdere CAD-ontwikkeling is voorlopig geparkeerd.

## Nieuw in v0.8.30
- Een lijn is nu expliciet een persistent afstandsmeetobject met `id`, startpunt, eindpunt, lengte, naam, eenheid, kleur, dikte, zichtbaarheid en timestamps.
- Nieuwe pagina **Metingen** toont alle gewone afstandsmetingen en hun totale lijnlengte.
- Een meting kan vanuit **Metingen** rechtstreeks worden geopend en bewerkt.
- Per lijn kan nu **cm/m**, lijnzichtbaarheid en maatlabelzichtbaarheid worden ingesteld.
- Maatlabels volgen de eenheid van de individuele meting.
- Nieuwe meetvelden worden meegenomen in Undo/Redo en projectopslag/herstel.
- De consistente module-state fix uit v0.8.29.1.3 blijft behouden.

## Stabiele baseline
De gebruiker heeft v0.8.29.1.3 fysiek gevalideerd: oppervlak → punt A → punt B → lijn werkt. De eerdere `null.Group`-crash geldt als opgelost.

## Testdoel v0.8.30
1. Start AR en teken één lijn.
2. Controleer dat het maatlabel direct zichtbaar is.
3. Open **☰ → Metingen** en open de gemaakte meting.
4. Wijzig naam, eenheid, kleur/dikte en zichtbaarheid; sla op.
5. Controleer Undo/Redo.
6. Sla het project op, heropen het en controleer dat de meeteigenschappen behouden blijven.

---

# Measure AR v0.8.29.1.3 — State Fix

Fixrelease voor de AR-tekencrash `Cannot read properties of null (reading 'Group')`. Alle ES-module imports gebruiken nu exact dezelfde build-ID, zodat `state.js` nog maar één gedeelde module-instantie oplevert. De werkende XR hit-test/surface-detectie uit v0.8.29.1.2 blijft behouden. Daarnaast is een expliciete rendering-state controle toegevoegd vóór punt/preview-geometrie wordt aangemaakt.

## Testdoel v0.8.29.1.3
- Start AR en wacht tot HUD `Hits > 0`, `Pose ✓`, `Target ✓` toont.
- Kies **Lijn** en druk op de blauwe bevestigingsknop om het eerste punt te plaatsen.
- Verwacht: geen `.Group`-fout; eerste punt verschijnt en `Start` wordt ingevuld.
- Richt op een tweede positie en bevestig opnieuw.
- Verwacht: lijn wordt zichtbaar en afstand/label wordt aangemaakt.
- Controleer daarna project openen/nieuw project en CAD-import regressie.

# Measure AR v0.8.29.1.2 — XR Surface Diagnostic

Diagnostische release op basis van v0.8.29.1. Geen surface-toleranties of geometrie gewijzigd. Live HUD toont Viewer, HitSource, Hits, Pose en Target.

# Measure AR v0.8.29.1 — CAD Preview

## Nieuw in v0.8.29.1
CAD-import heeft nu een verplichte 3D-preview buiten WebXR. Na bestandskeuze wordt het GLB/glTF-model eerst in een normale 3D-viewer getoond. De gebruiker kan draaien, zoomen en vaste 3D/boven/vooraanzichten kiezen. Measure AR toont vóór acceptatie de 1:1-afmetingen, mesh- en triangle-aantallen en bestandsgrootte. Een waarschuwing verschijnt bij ongebruikelijk grote modellen; de app schaalt nooit automatisch.

Pas na **Model gebruiken** wordt het bronbestand in IndexedDB opgeslagen en aan het actieve recovery-project gekoppeld. **Terug naar Measure AR en plaatsen** start daarna de bestaande AR-placementflow. De AI Builder uit v0.8.29.0 blijft behouden. De openstaande reference-capturebug bij **Project op locatie plaatsen** is niet onderdeel van deze release.

# Measure AR v0.8.29.0 — AI Builder Prototype

App: https://gasvdv-lab.github.io/Measure_tool/

## Nieuw in v0.8.29.0

Deze release voegt de eerste **geïsoleerde AI Builder-prototypeketen** toe. Het is bewust nog geen externe AI-integratie. De app gebruikt lokaal een beperkte, deterministische opdrachtinterpreter zodat we eerst de veilige keten `geselecteerde vorm → opdracht → parametrisch concept → opslaan/herstellen` kunnen testen zonder API-sleutels, kosten of invloed op de WebXR-core.

Prototypeworkflow: teken en bewaar een vorm → open die vorm via **Objecten** → kies **✨ AI Builder · prototype** → geef bijvoorbeeld `Maak hier een houten kist van 50 cm hoog` → het concept gebruikt de exacte contour van de vorm als footprint. Bestaande concepten kunnen met een exacte hoogte worden aangepast, bijvoorbeeld `Maak hem 80 cm hoog` of `Maak hem 20 cm hoger`. Een concept kan worden vastgezet/ontgrendeld en verwijderd.

Beperkingen: alleen **Conceptmodus**, alleen horizontale/bijna horizontale vormen, alleen eenvoudige kist/box/blok/volume-opdrachten met een expliciete maat. Dit prototype maakt een conceptvolume, geen constructief uitgewerkte houten kist. Er is nog geen LLM/API, geen Detailed Builder, geen Project Builder, geen materiaalengine en geen constructieve validatie.

Nieuw document: **MODULES.md** beschrijft vanaf deze release cumulatief de modules van de app, hun status en gebruik.

## Teststatus

Automatische statische tests zijn uitgevoerd op de releasebestanden. Fysieke Android/WebXR-tests blijven vereist, inclusief het AI-concept op een getekende vorm, opslaan/heropenen, undo/redo, CAD-placement bij voldoende licht en de reeds openstaande reference-capturetest.

---

# Measure AR v0.8.28.10 — Theme Selector

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

Deze versie voegt vijf professionele app-thema’s toe onder **Instellingen → App-thema**: Technical Green, Survey Blue, Industrial Orange, Precision Red en Neutral Steel. De keuze wordt lokaal onthouden en geldt ook op de losse CAD-importpagina. Functionele semantische kleuren (geldig/bevestigd, waarschuwing, fout) blijven onafhankelijk van het gekozen thema. De Professional Color Picker uit v0.8.28.9 blijft behouden.

# Measure AR v0.8.28.10 — Professional Color Picker

Deze release vervangt de beperkte browserkleurkeuze door één professionele, herbruikbare kleurkiezer voor lijnen, muren, vormopvulling en vormranden. De bestaande objectvelden blijven dezelfde HEX-kleurwaarden gebruiken; geometrie-, CAD-, project- en WebXR-logica zijn niet gewijzigd.

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

## Nieuw in v0.8.28.10
- Office-achtige themakleuren en uitgebreide kleurenmatrix.
- Recent gebruikte kleuren worden lokaal onthouden.
- **Meer kleuren…** opent een volledige mobiele picker met verzadiging/helderheid en hue-slider.
- HEX-invoer en afzonderlijke RGB-velden.
- Vergelijking **Huidig** versus **Nieuw** vóór toepassen.
- Knop **Standaard** herstelt de standaardkleur van het betreffende veld.
- Eén gedeelde component voor lijnkleur, muurkleur, vormopvulling en vormrand.
- Originele kleurinputs blijven de bronwaarde zodat bestaande save/create-logica compatibel blijft.
- Geen externe dependency en geen `TEST_RESULTS`-bestand.

# Measure AR v0.8.28.8 — AR HUD Refinement

## v0.8.28.8 — AR Visualization System

Visuele verfijningslaag voor technische AR-weergave: compactere maatlabels, consistente statuskleuren, tracking/snap-visuele taal, focus-mode hooks, CAD-statusstijl en outdoor-contrast hooks. De functionele JavaScript-kern is niet gewijzigd.


Deze release bouwt visueel verder op v0.8.28.6 en blijft bewust **UI-only**. De AR-interface is verder verfijnd zodat de echte werf meer ruimte krijgt: kleiner precisievizier, lichtere meetlabels, een slankere contextbalk, compactere actieve-toolweergave en subtielere statusinformatie.

**Functionele kern ongewijzigd:** alle JavaScript-modules zijn identiek aan v0.8.28.6. CAD-import, projectopslag, geometrie, tekenen, WebXR lifecycle, relocalisatie en IndexedDB zijn niet aangepast.

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

## UI-wijzigingen
- Precisievizier verder verkleind van 22 × 22 px naar 18 × 18 px.
- Geldige hit en snap blijven herkenbaar via subtiel groen/blauw lichtaccent.
- Bevestigingsknop visueel lichter en iets compacter, zonder de workflow te wijzigen.
- Lijn-, preview- en puntlabels kleiner en minder blokvormig.
- Teken-HUD omgevormd tot een slanke command strip.
- Actieve tool krijgt een kleine statusdot en compacte technische chip.
- Undo/redo/voltooien/stop nemen minder schermruimte in.
- Statuschips en instructieregel zijn terughoudender.
- Zoom-HUD en onderste hint zijn visueel gedempt.
- Touch-/eventlogica is niet gewijzigd.
- Geen losse TEST_RESULTS-bestanden.

# Measure AR v0.8.28.6 — Professional UI Pass

Deze release is bewust een **UI-only upgrade** op v0.8.28.5. De functionele JavaScript-modules zijn byte-for-byte ongewijzigd. De wijziging beperkt zich tot presentatie: compactere AR-HUD, kleiner/nauwkeuriger vizier, lichtere bevestigingsknop, professioneel bottom-sheet menu, rustigere typografie, subtielere labels en een consistente donkergroene technische stijl.

**Belangrijk:** CAD-import, projectopslag, WebXR lifecycle, tekenen, geometrie, relocalisatie en IndexedDB-logica zijn in deze release niet aangepast. De externe `cad-import.html`-flow uit v0.8.28.5 blijft behouden.

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

## UI-wijzigingen
- Vizier teruggebracht van 44 × 44 px naar een subtiele 22 × 22 px technische crosshair met centraal punt.
- Bevestigingsknop visueel compacter (56 px), met duidelijke groene actieve toestand; bediening blijft ruim genoeg voor mobiel gebruik.
- AR-topbalk compacter met minder visuele dominantie.
- Menu omgevormd naar een moderne mobiele bottom sheet met compactere navigatierijen.
- Teken-HUD smaller en lager in visueel gewicht; functies blijven op dezelfde DOM-id's en events aangesloten.
- Zoomcontrols verkleind.
- Lijn-, preview- en puntlabels subtieler gemaakt.
- Formulieren, kaarten, statusmeldingen en CAD-importpagina krijgen één consistente visuele taal.
- Geen losse `TEST_RESULTS`-bestanden.

# Measure AR v0.8.28.5 — External CAD Import Page

Deze build vervangt de CAD-importworkspace door een **volledig apart HTML-document (`cad-import.html`)**. De Android-bestandskiezer draait daardoor niet meer in hetzelfde document als WebXR/Measure AR. Na import wordt het model in IndexedDB opgeslagen en aan het recovery-project gekoppeld. Daarna keert de gebruiker terug naar een vers geladen `index.html`, waar één nieuwe tik AR start en de CAD-plaatsing activeert.

Deze build vervangt de instabiele native file-picker-in-WebXR flow. CAD-import gebeurt nu buiten immersive AR in een gewone DOM-workspace: AR wordt eerst bewust gepauzeerd, daarna kiest de gebruiker het bestand, en vervolgens wordt AR via een nieuwe gebruikersactie gestart voor plaatsing. Hiermee wordt voorkomen dat Android Chrome een half-afgesloten XR DOM-overlay achterlaat waarin knoppen niet meer reageren.

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

# Measure AR v0.8.28.5 — CAD Resume Fix

## Fix in v0.8.28.5
- **AR hervatten en CAD plaatsen** vraagt de nieuwe `immersive-ar`-sessie nu direct aan vanuit de gebruiker-tik, vóór enige asynchrone controle. Dit voorkomt verlies van Android/Chrome user activation.
- Na de nieuwe XR-sessie wordt `restoreCadRuntime()` expliciet uitgevoerd, zodat het geïmporteerde GLB/glTF opnieuw in de Three.js-scène staat vóór de plaatsingsmodus start.
- De oude kunstmatige wachttijd van 2,5 s op een CAD-event is verwijderd.
- Tijdens hervatten toont de knop **AR wordt hervat…**. Bij een fout blijft de CAD-importcontext actief en wordt Home niet geopend.
- De fix raakt de normale project-, teken- en CAD-importlogica verder niet.

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

## Fix in v0.8.28.5
- CAD-import heeft nu een persistente Home-block vanaf het openen van de Android-bestandskiezer tot AR hervat/plaatsing afgerond of geannuleerd is.
- De bescherming blijft actief ná `change`/`cancel`, zodat een vertraagd WebXR `end`-event niet meer door de guard kan glippen.
- De CAD-importstatus wordt ook in `sessionStorage` bewaard; bij een UI/browser-herinitialisatie wordt direct de CAD-context hersteld in plaats van Home.
- De CAD-menupagina en huidige projectstate blijven behouden tijdens deze externe file-picker overgang.
- De destructieve algemene XR-cleanup wordt niet uitgevoerd voor een CAD-file-picker onderbreking.
- CAD importeren en CAD plaatsen zijn nu technisch losgekoppeld: het GLB/glTF-bestand kan eerst veilig worden ingelezen en lokaal bewaard, ook wanneer de AR-sessie door de bestandskiezer is gestopt.
- Indien AR gestopt werd, verschijnt in CAD een knop **AR hervatten en CAD plaatsen**. Na hervatten wordt het gekozen model opnieuw uit IndexedDB geladen en gaat de plaatsingsmodus actief.
- Annuleren van de bestandskiezer blijft in de CAD-flow en navigeert niet naar Home.
- Bestaande project-, teken- en relocalisatielogica is niet inhoudelijk gewijzigd.

## CAD-flow na deze fix
1. Start AR.
2. Open ☰ → **CAD / 3D-model**.
3. Kies **CAD-model importeren**.
4. Selecteer een GLB/glTF.
5. Als Chrome AR actief houdt, start plaatsing meteen.
6. Als Android AR onderbreekt, blijf je in het CAD-scherm en kies je **AR hervatten en CAD plaatsen**.
7. Richt het vizier op de gewenste positie.
8. Regel rotatie/hoogte en kies **Plaats CAD hier**.

## Bekende openstaande bug
`Project op locatie plaatsen` / referentie-capture blijft openstaand. De witte bevestigingsknop kan in die flow nog onbruikbaar blijven. Deze bug is bewust niet meegenomen in deze CAD lifecycle-hotfix.

## Kwaliteitsregels
- Projectgeometrie blijft Project Space.
- CAD-plaatsing wordt in Project Space opgeslagen.
- AR-weergave gebruikt Project Transform zonder bronafmetingen te wijzigen.
- CAD-schaal blijft 1.0.
- Geen losse TEST_RESULTS-bestanden in release-ZIPs.
## v0.8.36.2 — Direction & Angle Constraint Repair
- Horizontaal · asvast heeft nu een expliciete X+/X−/Z+/Z− richtingkeuze die na selectie vergrendeld blijft.
- Loodrecht 90° gebruikt een bestaande referentielijn en laat links/rechts kiezen.
- Eigen hoek gebruikt dezelfde referentie-engine: opgegeven hoek + gekozen zijde bepalen de exacte richting.
- Exacte afstand blijft combineerbaar met asvast, 90° en eigen hoek.
- World Lock-reparatie uit v0.8.36.1 blijft behouden.
