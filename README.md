# Measure AR v0.8.13 — HUD & Drawing UX Refinement
Build: 20260822-2045

Deze release verfijnt alleen de bediening rond de Unified Drawing Core. De geometrische kern van v0.8.12 blijft behouden.

## Nieuw in v0.8.13
- Compactere teken-HUD die minder camerabeeld inneemt.
- Duidelijke statuschips voor actief vertrekpunt, referentielijn en zijde.
- Referentie- en zijde-info verschijnen alleen wanneer relevant.
- Richtings- en afstandspopovers zijn kleiner en sluiten contextueel na een geldige keuze.
- Referentielijn kan rechtstreeks vanuit de compacte richting-popover gekozen worden.
- HUD heeft `Compact` en `Meer info`.
- In Compact verdwijnen extra uitlegteksten; actieve tool/constraint/afstand blijven zichtbaar.
- `AUTO` en exacte afstand blijven instellingen; alleen de witte ronde knop bevestigt een punt.
- Geen terugkeer van het oude Placement- of Constraint-menu.

## Automatisch uitgevoerd — PASS
De volgende controles zijn automatisch uitgevoerd op deze build:
- JavaScript-syntax voor alle modules.
- Named imports/exports tussen alle modules.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben een handler.
- Oude modules `placement.js`, `drawing.js`, `drawing-engine.js`, `constraints.js` zijn afwezig.
- HUD statusvelden bestaan en zijn gekoppeld.
- HUD density-instelling is gekoppeld.
- Contextuele referentielogica is aanwezig.

## Automatisch uitgevoerd uit v0.8.12 — PASS
Eerder uitgevoerde core-tests blijven als regressiebasis gelden:
- Gewone lijn A→B stopt correct.
- B wordt actief eindpunt.
- Polyline A→B→C→D schuift het actieve vertrekpunt correct door.
- Undo herstelt het vorige actieve punt.
- Polyline Voltooien laat de lijn open.
- Vorm Sluiten voegt laatste punt → A toe.
- Exacte afstand horizontaal geeft de ingestelde lengte.
- Verticale exacte plaatsing houdt horizontale coördinaten vast.
- Parallel zonder referentielijn wordt geweigerd.
- Parallel met referentie werkt.
- Loodrecht levert 90°.
- Eigen hoek 45° wordt correct berekend.
- Dubbele lijn tussen dezelfde punten wordt geweigerd.
- Dependency-bescherming voor contouren/vormen/muren.
- Gebroken projectreferenties worden gedetecteerd.
- Mislukte lijnplaatsing laat geen los punt achter.
- Afgewerkte contour kan niet door late Undo worden beschadigd.

## Nog fysiek te testen — overgenomen uit eerdere versies
Deze tests vereisen echte WebXR/ARCore op de telefoon en blijven open totdat ze effectief uitgevoerd zijn:

### AR-sessie en tracking
- AR starten op het toestel.
- Menu openen/sluiten zonder trackingverlies.
- App naar achtergrond en terug.
- AR-sessie opnieuw starten na beëindiging.
- Alles wissen terwijl AR actief blijft.
- Tracking drift bij 1–5 minuten bewegen.
- Punt A blijft visueel exact op dezelfde fysieke plaats staan.

### Hit-test en oppervlakken
- Vloer herkennen.
- Verticale muur herkennen.
- Schuin vlak herkennen indien ARCore dit aanbiedt.
- Wissel tussen verschillende oppervlakken zonder plots verspringende kandidaten.
- `Op oppervlak` blijft in het juiste gekozen vlak.

### Gewone lijn
- A handmatig plaatsen.
- B handmatig plaatsen.
- Controle dat A niet verplaatst.
- Lijn stopt na B.
- Afstandslabel visueel controleren.
- Nieuwe lijn vanaf bestaand A/B.

### Doorlopende lijn
- A→B→C→D fysiek tekenen.
- B wordt start voor C.
- C wordt start voor D.
- Undo na D → C wordt opnieuw actief.
- Voltooien laat D open en maakt geen D→A.

### Vorm
- Driehoek horizontaal.
- Vierhoek horizontaal.
- Vorm op verticale muur.
- Vorm op schuin vlak.
- Niet-vlakke vorm >3 cm afwijking wordt geweigerd.
- Sluiten geeft laatste punt → A.
- Opvulling blijft visueel in het gekozen vlak.
- Oppervlakte plausibel controleren.

### AUTO versus exacte afstand
- AUTO op 3 verschillende afstanden.
- Exact 50 cm.
- Exact 100 cm.
- Exact 250 cm.
- Exact 1.50 m.
- Preview komt vóór bevestiging.
- Witte ronde knop is de enige definitieve bevestiging.

### Richtingen
- Vrij.
- Horizontaal.
- Verticaal omhoog.
- Verticaal omlaag.
- Op oppervlak.
- Parallel met referentielijn.
- Loodrecht 90°.
- Eigen hoek 30°.
- Eigen hoek 45°.
- Eigen hoek 90°.
- Zijde omkeren bij Loodrecht/Eigen hoek.

### Snapping
- Snappen naar bestaand punt.
- Snapping uit.
- Geen onverwachte snap die een actieve constraint breekt.

### Objecten en dependencies
- Punt verwijderen zonder dependencies.
- Lijn verwijderen zonder dependencies.
- Punt uit vorm proberen verwijderen → blokkeren.
- Lijn onder muur proberen verwijderen → blokkeren.
- Alleen vorm/opvulling verwijderen.
- Vorm + contour verwijderen.

### Muren
- Muur maken van bestaande lijn.
- Hoogte controleren.
- Dikte controleren.
- Links/rechts/gecentreerd.
- Kleur.
- Transparantie.
- Eigen muurhoek.
- Zichtbaar/verborgen.
- Muur verwijderen.

### HUD — nieuw te testen voor v0.8.13
- HUD neemt weinig camerabeeld in.
- Actief vertrekpunt is leesbaar.
- Referentiechip verschijnt alleen bij Parallel/Loodrecht/Eigen hoek.
- Zijdechip verschijnt alleen waar nodig.
- Richtingspopover opent en sluit correct.
- Afstandspopover opent en sluit correct.
- Referentielijn rechtstreeks in HUD kiezen.
- `AUTO` → popover sluit en camera bepaalt afstand.
- Exacte afstand → popover sluit en waarde blijft zichtbaar.
- Compact-modus is bruikbaar.
- Meer-info-modus toont context zonder knoppen te overlappen.
- HUD overlapt niet met witte plaatsknop, zoom of onderste hint.
- HUD blijft bruikbaar in portrait orientation.
- HUD blijft bruikbaar na schermrotatie indien WebXR dit toelaat.

## Bekend nog niet opgelost
- Definitieve labeloriëntatie en collision avoidance.
- Deur/raam/openingen in muren.
- Geavanceerde lijn/middenpunt-snapping.
- Volledige Redo-interface.
- Muur als volledig zelfstandig tekeninstrument komt later.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload alle bestanden uit deze ZIP. De oude tekenmodules mogen niet terugkomen.
