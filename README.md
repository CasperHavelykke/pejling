# Pejling

En genstandstæller til byturen. Man trykker, hver gang man drikker noget, og appen viser, hvor mange genstande der stadig er aktive i kroppen.

Alt ligger lokalt på telefonen. Der er ingen konto og ingen server.

Pejling er vejledende. Den måler ikke promille og kan ikke bruges til at vurdere, om man må køre.

## Kom i gang

```bash
npm install
```

```bash
npx expo start
```

Scan QR-koden med Expo Go på telefonen, eller tryk `w` for at åbne i browseren.

## Kommandoer

| Kommando | Hvad den gør |
| --- | --- |
| `npm test` | Kører tests af beregningen |
| `npm run typecheck` | Tjekker typer |
| `npx expo-doctor` | Tjekker opsætning og afhængigheder |

## Struktur

| Mappe | Indhold |
| --- | --- |
| `src/app` | Skærme (Expo Router) |
| `src/components` | Ugle, knapper, drawer, info-ark, ikoner |
| `src/domain` | Genstandstyper, beregning, tekster. Ren TypeScript uden UI |
| `src/state` | Hook der binder lagring og beregning sammen |
| `src/storage` | SQLite på telefonen, localStorage i browseren |
| `src/theme` | Farver, skrift og farveblanding |

## Beregning

Én genstand er 12 g alkohol. Promillen estimeres med Widmarks formel ud fra vægt og køn, og kroppen forbrænder ca. 0,15 promille i timen. Aktive genstande er promillen regnet tilbage til genstande.

En aften ryddes af sig selv, når kroppen har været i nul i mere end 8 timer. Indtagene bliver liggende i databasen, så de kan bruges til historik senere.
