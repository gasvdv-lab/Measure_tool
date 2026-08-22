# Measure AR v0.8.8.1 — Menu Repair
Build: 20260822-1615

Deze hotfix repareert de menu-interactie van v0.8.8.

## Gevonden fouten
- Twee verschillende placement-interfaces gebruikten dezelfde HTML IDs.
- `placementDistance`, `placementUnit`, `placementAngle` en `placementAngleWrap` kwamen dubbel voor.
- De universele HUD kon boven het menu liggen en touch/click events onderscheppen.
- De UI-binding was fragiel: één fout bij een element kon de verdere menu-initialisatie stoppen.
- `app.js` kon een tweede UI-initialisatie veroorzaken als het ooit rechtstreeks geladen werd.

## Reparaties
- Eén placement-interface overgehouden: de menu-gebaseerde `Punt op maat` pagina.
- Alle duplicate IDs verwijderd.
- Menu krijgt z-index 100 en expliciete pointer-events.
- UI-eventbinding volledig herschreven met veilige `bind()` helper.
- Ontbrekende UI-elementen veroorzaken een consolewaarschuwing in plaats van het hele menu stil te leggen.
- Bootstrap controleert nu of de menu-binding werkelijk klaar is.
- `app.js` is alleen nog een compatibility entry en initialiseert niets automatisch.
- Startup hardening, fixed points, muren, vormen, zoom en op-maat plaatsing blijven behouden.

## Vaste app-link
https://gasvdv-lab.github.io/Measure_tool/

Upload ALLE bestanden uit deze ZIP naar GitHub.
