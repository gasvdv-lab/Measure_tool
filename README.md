# Measure AR v0.8.9.1 — Constraint & Core Drawing Fix
Build: 20260822-1715

Deze hotfix volgt op een volledige audit van v0.8.9.

- Horizontaal, Verticaal, Op oppervlak, Parallel, Loodrecht en Eigen hoek gebruiken één tekenengine.
- Eigen hoek vereist altijd een referentielijn.
- Parallel en Loodrecht vereisen eveneens een referentielijn.
- Het hoekveld verschijnt alleen bij Eigen hoek.
- Referentie-informatie verschijnt alleen waar nodig.
- De geselecteerde richting krijgt een duidelijke actieve stijl.
- applyConstraint krijgt nu het echte actieve vertrekpunt.
- Na A→B wordt B altijd het nieuwe actieve vertrekpunt.
- De oude ongedefinieerde setParametricStartPoint-aanroep in drawing.js is verwijderd.
- Snapping mag een actieve constraint niet meer verbreken.
- Op oppervlak gebruikt het vlak dat bij het actieve vertrekpunt werd vastgelegd.
- AR surface-normal gebruikt correct S.reticle.matrix.
- De circulaire dependency drawing-engine ↔ ar.js is verwijderd.
- AR afsluiten staat nergens meer in het menu.

Vaste app-link:
https://gasvdv-lab.github.io/Measure_tool/

Upload ALLE bestanden uit deze ZIP naar GitHub.
