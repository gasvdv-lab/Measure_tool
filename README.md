# Measure AR v0.8.14 — Snapping & References
Build: 20260822-2130

Deze release bouwt verder op de stabiele Unified Drawing Core en verfijnt snapping en referentielijnen.

## Nieuw in v0.8.14
- `Smart` snapping is nu de standaard.
- Smart-prioriteit: bestaand punt → lijnmidden → dichtstbijzijnde positie op lijn.
- Afzonderlijke snapmodi: Smart, Alleen punten, Alleen middelpunten, Alleen lijnen, Uit.
- Snapping respecteert de actieve constraint; een snap mag Horizontaal/Verticaal/Op oppervlak/Parallel/Loodrecht/Eigen hoek niet verbreken.
- Exacte-afstandsmodus blijft exact: alleen een bestaand punt binnen 5 mm van de exact berekende positie mag hergebruikt worden.
- Preview toont welk snaptype actief is.
- Compacte HUD toont tijdelijk `Snap: punt`, `Snap: midden` of `Snap: lijn`.
- Referentielijn blijft rechtstreeks in de HUD selecteerbaar.
- Nieuwe knop `Gebruik laatste lijn` voor snelle referentiekeuze.
- Zijde/Richting-chip is rechtstreeks aanklikbaar om de richting om te keren.
- Parallel toont `voor/tegen`; Loodrecht en Eigen hoek tonen `links/rechts`.

## Tests automatisch uitgevoerd na genereren — PASS
### Statische applicatietests
- Alle JavaScriptmodules slagen voor syntaxcontrole.
- Alle named imports verwijzen naar bestaande exports.
- Geen dubbele HTML-ID's.
- Alle UI-ID-referenties bestaan.
- Alle statische knoppen hebben een handler.
- Oude tekenmodules blijven verwijderd.
- Nieuwe snapkeuzes bestaan in UI en state.
- Laatste-referentielijnknop is gekoppeld.
- Klikbare zijde-chip is gekoppeld.
- Snapstatus-chip is gekoppeld.

### Algoritmische snappingtests — PASS
- Dichtstbijzijnde punt op een lijnsegment wordt correct berekend.
- Middelpuntberekening is correct.
- Smart snap geeft een punt voorrang op middenpunt/lijn.
- Exacte afstand gebruikt de 5-mm-hergebruikgrens correct.
- Horizontale snapping weigert kandidaten buiten de tolerantie.
- Verticale snapping controleert X/Z-afwijking correct.
- Lijnsnap wordt correct begrensd tot het segment en loopt niet voorbij een eindpunt.

## Eerder automatisch uitgevoerd — PASS
De regressiebasis uit v0.8.12/v0.8.13 blijft geldig:
- Gewone lijn A→B stopt correct.
- B wordt actief eindpunt.
- Polyline A→B→C→D schuift het vertrekpunt door.
- Undo herstelt vorig vertrekpunt.
- Polyline Voltooien blijft open.
- Vorm Sluiten maakt laatste→A.
- Exacte horizontale afstand.
- Exacte verticale plaatsing.
- Parallel zonder referentie wordt geweigerd.
- Parallel met referentie.
- Loodrecht 90°.
- Eigen hoek 45°.
- Dubbele lijn wordt geweigerd.
- Dependencybescherming voor contour/vorm/muur.
- Projectvalidator detecteert gebroken referenties.
- Mislukte lijncreatie ruimt tijdelijk punt op.
- Afgewerkte contour wordt niet beschadigd door late Undo.
- Alle HUD-elementen uit v0.8.13 bestaan en zijn gekoppeld.

## Nog fysiek te testen — cumulatief
Deze tests vereisen echte WebXR/ARCore en blijven open.

### AR-sessie en tracking
- AR starten.
- Menu openen/sluiten zonder trackingverlies.
- App naar achtergrond en terug.
- AR opnieuw starten.
- Alles wissen terwijl AR actief blijft.
- Drift gedurende 1–5 minuten.
- Bevestigd punt blijft visueel op dezelfde fysieke positie.

### Hit-test / tekenvlakken
- Vloer.
- Verticale muur.
- Schuin vlak indien beschikbaar.
- Wisselen tussen oppervlakken zonder sprong.
- Op oppervlak blijft in het actieve vlak.

### Gewone lijn
- A plaatsen.
- B plaatsen.
- A blijft vast.
- Tool stopt na B.
- Label/afstand visueel controleren.
- Nieuwe lijn vanaf A en B.

### Doorlopende lijn
- A→B→C→D.
- B wordt start van C.
- C wordt start van D.
- Undo D herstelt C.
- Voltooien laat polyline open.

### Vorm
- Horizontale driehoek.
- Horizontale vierhoek.
- Verticale vorm.
- Schuine vorm.
- Niet-vlakke vorm >3 cm wordt geweigerd.
- Sluiten maakt laatste→A.
- Opvulling blijft in vlak.
- Oppervlakte plausibel.

### AUTO / exacte afstand
- AUTO op meerdere afstanden.
- 50 cm.
- 100 cm.
- 250 cm.
- 1.50 m.
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
- Links/rechts of voor/tegen omkeren.

### Snapping — uitgebreid voor v0.8.14
- Smart snap naar bestaand punt.
- Smart snap naar lijnmidden.
- Smart snap naar lijn.
- Alleen punten.
- Alleen middelpunten.
- Alleen lijnen.
- Snapping uit.
- Punt heeft zichtbaar voorrang boven lijn/midden wanneer meerdere kandidaten in bereik zijn.
- Horizontale constraint blijft behouden na snap.
- Verticale constraint blijft behouden na snap.
- Op-oppervlak constraint blijft behouden na snap.
- Parallel/Loodrecht/Eigen hoek blijven behouden na snap.
- Exacte afstand verandert niet merkbaar door Smart snap.
- Exact punt op berekende plaats kan worden hergebruikt.
- Snapstatus-chip verschijnt en verdwijnt correct.
- Geen ongewenste snap naar het actieve vertrekpunt.

### Referentielijnen — uitgebreid voor v0.8.14
- Referentielijn via dropdown kiezen.
- `Gebruik laatste lijn`.
- Parallel gebruikt gekozen referentie.
- Loodrecht gebruikt gekozen referentie.
- Eigen hoek gebruikt gekozen referentie.
- Referentiechip toont juiste lijn.
- Richting/Zijde-chip omkeren via chip.
- Parallel voor/tegen omschakelen.
- Loodrecht links/rechts omschakelen.
- Eigen hoek links/rechts omschakelen.
- Geen referentie beschikbaar → duidelijke fout.

### Objecten / dependencies
- Los punt wissen.
- Losse lijn wissen.
- Punt uit vorm blokkeren.
- Muur-basislijn blokkeren.
- Alleen vorm/opvulling wissen.
- Vorm + contour wissen.

### Muren
- Muur uit lijn.
- Hoogte/dikte.
- Links/rechts/gecentreerd.
- Kleur/transparantie.
- Eigen hoek.
- zichtbaar/verborgen.
- verwijderen.

### HUD
- Neemt weinig camerabeeld in.
- Actief vertrekpunt leesbaar.
- Referentiechip contextueel.
- Zijdechip contextueel.
- Snapchip contextueel.
- Popovers openen/sluiten.
- Exacte afstand blijft zichtbaar.
- Compact/Meer info.
- Geen overlap met shutter/zoom/hint.
- Portrait en rotatie.

## Bekend nog niet opgelost
- Definitieve labeloriëntatie/collision avoidance.
- Volledige Redo-interface.
- Deur/raam/openingen.
- Muur als volledig zelfstandig tekengereedschap.
- Lijnintersectie-snapping is nog niet toegevoegd; dat kan later bij geavanceerde snapping.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload alle bestanden uit deze ZIP. Oude tekenmodules mogen niet terugkomen.
