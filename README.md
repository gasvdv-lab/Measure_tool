# Measure AR v0.8.11 — Unified Drawing Core
Build: 20260822-1945

Deze release is een structurele refactor van de tekenmotor.

## Kern
- Hoofdmenu kiest alleen WAT je tekent: Lijn, Doorlopende lijn, Vorm, Uitzetten.
- Het AR-scherm bepaalt HOE het volgende segment wordt geplaatst via een compacte HUD.
- De witte ronde knop is de enige knop die een punt definitief maakt.
- AUTO = handmatige plaatsing met camera.
- Exacte afstand = de engine berekent een kandidaatpunt; de witte knop bevestigt het.
- Eén centrale state voor tool, actief punt, tekenvlak, plaatsingsmodus, afstand, constraint, hoek en referentielijn.
- Oude placement.js, drawing.js, drawing-engine.js en dubbele constraintflow zijn verwijderd.

## Doorlopende lijn
A → B → C → D → ...
Ieder bevestigd eindpunt wordt automatisch het vertrekpunt van het volgende segment.
Voltooien laat de lijn OPEN.

## Vorm
Werkt met dezelfde kettinglogica.
Sluiten voegt alleen bij Vorm de laatste lijn terug naar A toe.

## 3D-tekenbasis
- Actief tekenvlak wordt aan het vertrekpunt gekoppeld.
- Horizontaal, Verticaal, Op oppervlak, Parallel, Loodrecht en Eigen hoek gebruiken dezelfde geometrische kern.
- Eigen hoek, Parallel en Loodrecht gebruiken een referentielijn.
- Zijde kan compact worden omgekeerd.

## Preview / Confirm
- Kandidaatpunt en voorlopige stippellijn zijn visueel verschillend van definitieve geometrie.
- Alleen de witte ronde knop bevestigt.
- Snappen naar bestaande punten kan aan/uit.

## Stabiliteit
- Hit-test samples van verschillende bronnen worden niet meer gemengd.
- Punten blijven immutable op hun bevestigde wereldpositie.
- Lijnen worden als dunne 3D-cilinders getekend zodat lijndikte op Android/WebGL daadwerkelijk zichtbaar is.
- Vormoppervlakken worden in hun echte 3D-vlak geprojecteerd; ze zijn niet meer hard gecodeerd als horizontaal.

## Objectintegriteit
- Lijnen/punten die door vormen of muren worden gebruikt worden niet stil verwijderd.
- Vorm kan opnieuw apart worden verwijderd als opvulling of samen met de contour.
- Vormstijl is achteraf bewerkbaar.

## Nog bewust niet uitgebreid
- Deur/raam/openingen in muren.
- Geavanceerde lijn/oppervlak-snapping.
- Volledige redo-UI.
- Labelrotatie blijft een apart bekend onderwerp.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload ALLE bestanden uit deze ZIP. Verwijder in GitHub ook de oude bestanden:
- js/placement.js
- js/drawing.js
- js/drawing-engine.js
- js/constraints.js
