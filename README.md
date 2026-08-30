# Measure AR v0.8.29.2 — Startinterface / Navigation Core

App: https://gasvdv-lab.github.io/Measure_tool/

## Nieuw in v0.8.29.2
De startinterface is herwerkt rond de brede, domeinonafhankelijke productvisie. De gebruiker kiest nu vanuit **Meten · Plaatsen · Maken · Ervaren · Controleren** in plaats van eerst een technische AR-functie te moeten begrijpen. **Ervaren** en **Controleren** zijn bewust zichtbaar maar nog uitgeschakeld: ze leggen de toekomstige navigatiestructuur vast zonder niet-bestaande functionaliteit te simuleren.

- **Meten** start AR en opent de bestaande meet-/tekengereedschappen.
- **Plaatsen** opent rechtstreeks de bestaande aparte CAD-import/previewpagina, dus zonder eerst WebXR te starten.
- **Maken** start AR en opent de bestaande create/tekenomgeving.
- **Projecten** start AR en opent het bestaande projectoverzicht.
- **AR direct starten** blijft beschikbaar als technische snelweg.
- De AR-, World Lock-, geometry-, CAD-placement- en projectopslaglogica zijn inhoudelijk niet herschreven.
- De bekende reference-capturebug bij **Project op locatie plaatsen** blijft open en is niet als opgelost gemarkeerd.
- Geen `TEST_RESULTS`-bestanden in de release.

## Test v0.8.29.2
**PC:** startpagina toont de vijf hoofdrichtingen; Plaatsen opent CAD Preview; Ervaren/Controleren zijn zichtbaar maar niet actief.

**AR-IN:** test Meten, Maken, Projecten en AR direct starten afzonderlijk. Controleer dat de AR-sessie normaal start, het juiste bestaande menu opent en tekenen/World Lock niet is gewijzigd.

---

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

## Productrichting vanaf v0.8.29.1
Measure AR groeit domeinonafhankelijk rond **Measure · Place · Create · Experience · Verify**, met Capture als contextuele laag. Nieuwe modules worden ontworpen richting gedeelde Spatial Objects, universele Select/Edit, constraints/relaties, Environment Context, Clearance/Collision, Object Library, Variants/Scenes en Presentation/Experience. AI interpreteert intentie; exacte geometrie en berekeningen blijven deterministisch. Wegenis- en bedrijfsspecifieke wegenbouwworkflows vallen buiten deze app. De eerstvolgende geplande functionele release is **v0.8.29.2 — Startinterface / Navigation Core**; daarbij blijft de stabiele AR/World Lock/geometry-core ongemoeid.
