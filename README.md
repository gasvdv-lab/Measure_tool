# Measure AR v0.8.5 — Direct AR Launch

## Nieuw
- Geen klassiek startscherm meer.
- Bij openen van de GitHub Pages-link probeert de app meteen WebXR/AR te starten.
- Als de browser een gebruikersactie vereist, verschijnt alleen een eenvoudige fallback met:
  - foutmelding
  - knop `AR opnieuw starten`
- Instellingen zitten uitsluitend nog in het AR-menu.
- `Startscherm` is vervangen door `AR afsluiten`.

## Behouden
- v0.8.4 placement UI fix
- standaard cm
- fixed points
- universele constraints
- handmatig / op maat plaatsen
- doorlopend tekenen
- vormen
- muren via walls.js
- zoom
- objectbeheer
- Alles wissen zonder AR te verlaten

## Opmerking
Sommige Android/Chrome-versies vereisen een expliciete gebruikersactie voor een immersive-ar sessie.
In dat geval kan WebXR niet volledig automatisch starten. De app toont dan alleen de compacte knop
`AR opnieuw starten`; het oude startscherm komt niet terug.
