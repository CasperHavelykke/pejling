# Pejling

En genstandstæller til byturen. Man trykker, hver gang man drikker noget, og appen viser, hvor mange genstande der stadig er aktive i kroppen.

Alt ligger lokalt på telefonen. Der er ingen konto og ingen server.

Pejling er vejledende. Den måler ikke promille og kan ikke bruges til at vurdere, om man må køre.

- App Store: https://apps.apple.com/app/pejling/id6817084330
- Hjemmeside: https://pejlingapp.dk

Appen er bygget med React Native og Expo og findes på dansk og engelsk.

## Kom i gang

```bash
npm install
```

```bash
npx expo start
```

Scan QR-koden med Expo Go på telefonen, eller tryk `w` for at åbne i browseren.

Påmindelser virker ikke i Expo Go på Android. Der kræver de et rigtigt byg.

## Kommandoer

| Kommando | Hvad den gør |
| --- | --- |
| `npm test` | Kører tests af beregning, tekster og påmindelser |
| `npm run typecheck` | Tjekker typer |
| `npx expo-doctor` | Tjekker opsætning og afhængigheder |

## Struktur

| Mappe | Indhold |
| --- | --- |
| `src/app` | Skærme (Expo Router) |
| `src/components` | Ugle, knappaneler, skuffe, info-ark, ikoner |
| `src/domain` | Genstandstyper, beregning, historik, påmindelsernes tidspunkter. Ren TypeScript uden UI |
| `src/i18n` | Alle tekster på dansk og engelsk |
| `src/notifications` | Lokale påmindelser |
| `src/state` | Hook der binder lagring og beregning sammen |
| `src/storage` | SQLite på telefonen, localStorage i browseren |
| `src/theme` | Farver, skrift og farveblanding |
| `site` | Hjemmesiden pejlingapp.dk med privatlivspolitik |
| `scripts` | Script der laver skærmbilleder til butikkerne |

## Indtastning

Knapperne ligger i tre paneler, som man swiper imellem:

- **Simpel** har én knap pr. slags: øl, vin, drink og shot.
- **Avanceret** har flere størrelser og styrker af øl, drinks og shots.
- **Tilpasset** er til alt andet. Man vælger type, størrelse og styrke, og de tre seneste valg kan logges igen med ét tryk.

## Beregning

Én genstand er 12 g alkohol. Promillen estimeres med Widmarks formel ud fra vægt og køn, og kroppen forbrænder ca. 0,15 promille i timen. Aktive genstande er promillen regnet tilbage til genstande.

En aften ryddes af sig selv, når kroppen har været i nul i mere end 3 timer. Indtastningerne bliver liggende i databasen og vises i historikken.

## Historik

Kalenderen åbnes fra listen "I aften". En aften hører til den dato, den startede, også når den fortsætter efter midnat. Feltets farve viser aftenens højeste antal aktive genstande, og tallet er genstande i alt.

Vægt og køn gemmes sammen med hver indtastning. Gamle aftener ændrer sig derfor ikke, når man retter sine indstillinger.

## Påmindelser

Påmindelser er slået fra som udgangspunkt og slås til i info-arket. Appen minder om at logge en time efter den seneste indtastning, højst tre gange, og kun mens der er aktive genstande. De planlægges på telefonen og sendes ikke fra en server.

## Licens

Koden ligger her, så man kan se, hvordan appen virker. Der er ingen licens, så den må ikke genbruges uden aftale. Uglen, ikonerne og teksterne er mine egne.
