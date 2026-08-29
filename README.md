# Measure AR v0.8.28.3 — CAD Resume Fix

## Fix in v0.8.28.3
- **AR hervatten en CAD plaatsen** vraagt de nieuwe `immersive-ar`-sessie nu direct aan vanuit de gebruiker-tik, vóór enige asynchrone controle. Dit voorkomt verlies van Android/Chrome user activation.
- Na de nieuwe XR-sessie wordt `restoreCadRuntime()` expliciet uitgevoerd, zodat het geïmporteerde GLB/glTF opnieuw in de Three.js-scène staat vóór de plaatsingsmodus start.
- De oude kunstmatige wachttijd van 2,5 s op een CAD-event is verwijderd.
- Tijdens hervatten toont de knop **AR wordt hervat…**. Bij een fout blijft de CAD-importcontext actief en wordt Home niet geopend.
- De fix raakt de normale project-, teken- en CAD-importlogica verder niet.

GitHub Pages: https://gasvdv-lab.github.io/Measure_tool/

## Fix in v0.8.28.3
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