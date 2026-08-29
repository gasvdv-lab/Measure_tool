# TESTING.md — Measure AR

## Verplichte regressie v0.8.21.2
Test op smartphone in AR-IN voordat Relocalization verdergaat:
1. Horizontaal + exact: 0,50 / 1,00 / 2,50 m; eindpunt blijft op gelijke Y en afstand blijft exact.
2. Verticaal + exact: 0,50 / 1,00 / 2,50 m; kies Omhoog en Omlaag; kandidaat mag niet met camera-positie verschuiven behalve schermprojectie.
3. Verticaal + AUTO: kandidaat blijft op de verticale as door het actieve punt en uitsluitend aan de gekozen zijde.
4. Op oppervlak + exact/AUTO: kandidaat blijft in actief vlak.
5. Parallel + exact/AUTO: beide richtingen testen.
6. Loodrecht + exact/AUTO: links/rechts testen.
7. Eigen hoek 30°/45°/90° + exact/AUTO: links/rechts testen.
8. Vrij + exact/AUTO.
9. Muur maken → Objecten → Muren: muur moet zichtbaar zijn in lijst en wisbaar zijn.
10. Undo/Redo na lijn en muur; Objectenlijst en scène moeten synchroon blijven.

# Measure AR — Testing

## Testcodes
- **AUTO** — automatische/statische tests bij iedere build.
- **PC** — laptop/browser zonder echte AR.
- **AR-IN/A4** — smartphone binnen op de vaste A4-testbench.
- **AR-IN/ROOM** — smartphone binnen op meterschaal.
- **AR-OUT** — smartphone buiten voor terrein, GPS en real-world nauwkeurigheid.

## Vaste volgorde per upgrade
1. AUTO
2. PC indien van toepassing
3. AR-IN/A4 voor snelle fysieke regressie
4. AR-IN/ROOM wanneer schaal/tracking relevant is
5. AR-OUT alleen wanneer terrein, GPS of buiten-nauwkeurigheid relevant is

Niet-uitgevoerde fysieke tests blijven open en worden naar volgende versies meegenomen.

## Directe regressietest v0.8.21.2
Doel: controle van **exacte afstand + Horizontaal**.

1. Start een polylijn en plaats punt A of kies een bestaand vertrekpunt.
2. Kies **Horizontaal**.
3. Kies een exacte afstand, eerst 50 cm, daarna 100 cm en daarna 250 cm.
4. Richt het groene vizier duidelijk links/rechts van het vertrekpunt op hetzelfde horizontale niveau.
5. Controleer vóór bevestiging:
   - previewlijn vertrekt exact uit het actieve punt;
   - previewlijn wijst naar de richting van het vizier;
   - label blijft exact de ingestelde afstand tonen;
   - preview blijft horizontaal in de AR-wereld, niet op het scherm.
6. Bevestig uitsluitend met de witte ronde knop.
7. Herhaal met 5,20 m indien de ruimte dit toelaat.

### Daarna regressie van andere exacte constraints
- Vrij + exacte afstand
- Verticaal + exacte afstand
- Op oppervlak + exacte afstand
- Parallel + exacte afstand
- Loodrecht + exacte afstand
- Eigen hoek + exacte afstand

## A4-testbench
Een gestandaardiseerd afdrukbaar testblad wordt als volgende testinfrastructuur toegevoegd. Afdrukken moet op 100% schaal gebeuren, zonder 'passen aan pagina'.
