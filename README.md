# Measure AR v0.8.9.3 — Action & Result Flow
Build: 20260822-1835

Deze release maakt een duidelijke scheiding tussen kiezen/configureren en het resultaat in AR bekijken.

Belangrijkste wijzigingen:
- `Punt op maat plaatsen` sluit na een geslaagde plaatsing onmiddellijk het menu.
- Het resultaat wordt daarna duidelijk in AR getoond: nieuw punt, lijnnaam, afstand en actief vertrekpunt.
- Het nieuw geplaatste punt blijft intern het actieve vertrekpunt voor de volgende stap.
- Een korte action-lock voorkomt dubbele plaatsingen door dubbel tikken.
- Muur aanmaken sluit na succes het menu en toont de muur in AR.
- Vorm aanmaken sluit na succes het menu en toont de vorm in AR.
- Referentielijn instellen sluit na succes het menu en bevestigt welke lijn actief is.
- Alles wissen sluit na bevestiging het menu; AR blijft actief.
- Verwijderacties voor lijn, punt, muur en vorm sluiten na uitvoering het menu en tonen het resultaat.
- Instellingen blijven in het menu, omdat dit configuratie is en geen tekenactie.
- Alle menu-knoppen zijn opnieuw statisch gecontroleerd op geldige handlers.
- Constraint/core-fixes en menu-action-repair uit eerdere releases blijven behouden.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload ALLE bestanden uit deze ZIP naar GitHub.
