// Ikoner til knapperne. De håndtegnede er Caspers egne (Affinity-eksport),
// resten er Lucide. Stregen følger den farve, der gives med.
//
// Ikoner i samme familie deler viewBox, så størrelsesforholdet mellem dem
// er geometri og ikke noget, der skal justeres pr. knap:
//   shots     17×27. 2 cl-glassene (14×21) står centreret i rammen.
//   cocktails samme ramme om det samme glas; sugerør og pynt rager ud.

import type { ReactNode } from "react";
import Svg, { Ellipse, G, Path } from "react-native-svg";
import type { DrinkIconKey } from "../domain/drinks";

type Props = { height: number; color: string };

function Frame({
  viewBox,
  height,
  color,
  children,
}: Props & { viewBox: [number, number, number, number]; children: ReactNode }) {
  const [, , w, h] = viewBox;
  return (
    <Svg
      viewBox={viewBox.join(" ")}
      width={(height * w) / h}
      height={height}
      fill="none"
      stroke={color}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </Svg>
  );
}

// --- Øl ------------------------------------------------------------------

function Bottle(props: Props) {
  return (
    <Frame viewBox={[0, 0, 13, 27]} {...props}>
      <G transform="translate(-0.646948,0.2)">
        <Path
          transform="matrix(0.996733,0,0,1.2,-5.13018,-1.4)"
          strokeWidth={2.18}
          d="M10,3C10,2.451 10.451,2 11,2L13,2C13.549,2 14,2.451 14,3L14,5C14,6.298 14.421,7.562 15.2,8.6L15.8,9.4C16.579,10.438 17,11.702 17,13L17,21C17,21.549 16.549,22 16,22L8,22C7.451,22 7,21.549 7,21L7,13C7,11.702 7.421,10.438 8.2,9.4L8.8,8.6C9.579,7.562 10,6.298 10,5L10,3Z"
        />
        <Path
          transform="matrix(-0.915142,0,0,0.915142,12.3215,3.68312)"
          strokeWidth={2.19}
          strokeMiterlimit={1.5}
          d="M6,18.178C6.807,18.178 7.685,17.709 8.078,17.255C8.663,16.579 8.79,15.162 8.541,13.716C8.334,12.518 7.208,11.354 7.239,11.32C7.782,10.729 7.777,10.556 7.756,10.122C7.735,9.688 7.054,9.027 6,9.089C4.946,9.027 4.265,9.688 4.244,10.122C4.223,10.556 4.218,10.729 4.761,11.32C4.792,11.354 3.666,12.518 3.459,13.716C3.21,15.162 3.337,16.579 3.922,17.255C4.315,17.709 5.193,18.178 6,18.178Z"
        />
      </G>
    </Frame>
  );
}

// Lucides fadølskrus: 50 cl aflæses på ikonet.
function Mug(props: Props) {
  return (
    <Frame viewBox={[0, 0, 24, 24]} {...props}>
      <G strokeWidth={2}>
        <Path d="M17 11h1a3 3 0 0 1 0 6h-1" />
        <Path d="M9 12v6" />
        <Path d="M13 12v6" />
        <Path d="M14 7.5c-1 0-1.44.5-3 .5s-2-.5-3-.5-1.72.5-2.5.5a2.5 2.5 0 0 1 0-5c.78 0 1.57.5 2.5.5S9.44 2 11 2s2 1.5 3 1.5 1.72-.5 2.5-.5a2.5 2.5 0 0 1 0 5c-.78 0-1.5-.5-2.5-.5Z" />
        <Path d="M5 8v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
      </G>
    </Frame>
  );
}

// --- Cocktails -----------------------------------------------------------

// Lucides martiniglas i dets egne koordinater (24×24).
function Glass() {
  return (
    <G strokeWidth={2}>
      <Path d="M12 12 4.207 4.207A.707.707 0 0 1 4.707 3h14.586a.707.707 0 0 1 .5 1.207z" />
      <Path d="M12 12v10" />
      <Path d="M7 22h10" />
    </G>
  );
}

// Fælles ramme i glassets koordinater. Den rummer sugerør og pynt fra den
// stærke variant, så glasset er præcis lige stort i alle tre.
const COCKTAIL_BOX: [number, number, number, number] = [-1.2, -4.6, 27.6, 28.6];

function CocktailSimple(props: Props) {
  return (
    <Frame viewBox={[0, 0, 24, 24]} {...props}>
      <Glass />
    </Frame>
  );
}

function CocktailMild(props: Props) {
  return (
    <Frame viewBox={COCKTAIL_BOX} {...props}>
      <Glass />
    </Frame>
  );
}

// Tegningerne er eksporteret med glasset skaleret forskelligt. Den ydre
// matrix regner dem tilbage til glassets egne koordinater.
function CocktailMedium(props: Props) {
  return (
    <Frame viewBox={COCKTAIL_BOX} {...props}>
      <G transform="matrix(0.948686,0,0,0.948686,2.99984,-1.48005)">
        <G transform="matrix(1,0,0,1,-4.06546,-2.76109)">
          <G transform="matrix(1.05409,0,0,1.05409,0.90336,4.32119)">
            <Glass />
          </G>
          <Path
            transform="matrix(1.22562,0,0,1.22562,-0.420799,-0.792186)"
            strokeWidth={1.22}
            strokeMiterlimit={1.5}
            d="M14.183,6.752C14.183,6.752 17.212,4.662 18.405,3.839C18.715,3.625 19.082,3.511 19.458,3.511C20.452,3.511 22.38,3.511 22.38,3.511"
          />
        </G>
      </G>
    </Frame>
  );
}

function CocktailStrong(props: Props) {
  return (
    <Frame viewBox={COCKTAIL_BOX} {...props}>
      <G transform="matrix(1.162735,0,0,1.162735,-0.704315,-4.228076)">
        <G transform="matrix(1,0,0,1,-1.07377,-0.535741)">
          <G transform="matrix(0.860041,0,0,0.860041,1.67951,4.17206)">
            <Glass />
          </G>
          <Path
            transform="matrix(1,0,0,1,0.599117,0)"
            strokeWidth={1.5}
            strokeMiterlimit={1.5}
            d="M14.183,6.752C14.183,6.752 17.04,4.781 18.298,3.913C18.677,3.651 19.127,3.511 19.588,3.511C20.61,3.511 22.38,3.511 22.38,3.511"
          />
          <G
            transform="matrix(1,0,0,1,-1.37306,-0.112675)"
            strokeWidth={1.5}
            strokeMiterlimit={1.5}
          >
            <Path d="M9.225,6.752L5.676,3.934L9.788,1.398" />
            <Path d="M5.676,3.934L3.197,8.243" />
          </G>
        </G>
      </G>
    </Frame>
  );
}

// --- Vin -----------------------------------------------------------------

// Lucides vinglas.
function Wine(props: Props) {
  return (
    <Frame viewBox={[0, 0, 24, 24]} {...props}>
      <G strokeWidth={2}>
        <Path d="M8 22h8" />
        <Path d="M7 10h10" />
        <Path d="M12 15v7" />
        <Path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
      </G>
    </Frame>
  );
}

// --- Shots ---------------------------------------------------------------

const SHOT_BOX: [number, number, number, number] = [0, 0, 17, 27];
// 2 cl-glasset (14×21) centreret i 17×27.
const SHOT_2CL_OFFSET = "translate(1.5,3)";

// Glassets sider og bund. Siderne buer let udad mod kanten.
const SHOT_SIDES =
  "M1.193,7.554C1.193,7.554 1.844,9.061 2.144,10.697C2.453,12.388 2.807,17.721 2.807,17.721L9.193,17.721C9.193,17.721 9.547,12.388 9.856,10.697C10.156,9.061 10.807,7.554 10.807,7.554";

// weight ganger stregtykkelsen op, når glasset tegnes formindsket.
function Glass2cl({ strong, weight = 1 }: { strong: boolean; weight?: number }) {
  return (
    <>
      <Path
        transform="matrix(1.20787,0,0,1.67689,-0.441571,-9.71619)"
        strokeWidth={1.37 * weight}
        strokeMiterlimit={1.5}
        d={SHOT_SIDES}
      />
      <Ellipse
        transform="matrix(1.25293,0,0,1.25293,-0.71198,-7.35258)"
        strokeWidth={1.6 * weight}
        cx={6}
        cy={8.223}
        rx={4.634}
        ry={1.557}
      />
      {strong && (
        <G strokeWidth={2}>
          <Path d="M4.656,11.318L9.093,11.318" />
          <Path
            transform="matrix(0,1,-1,0,18.1929,4.44367)"
            d="M4.656,11.318L9.093,11.318"
          />
        </G>
      )}
    </>
  );
}

function Glass4cl({ strong }: { strong: boolean }) {
  return (
    <G transform="translate(0.0099117,0)">
      <Path
        transform="matrix(1.52779,0,0,2.12104,-0.833304,-12.5579)"
        strokeWidth={1.08}
        strokeMiterlimit={1.5}
        d={SHOT_SIDES}
      />
      <Ellipse
        transform="matrix(1.58265,0,0,1.58265,-1.1625,-9.55063)"
        strokeWidth={1.26}
        cx={6}
        cy={8.223}
        rx={4.634}
        ry={1.557}
      />
      {strong && (
        <G strokeWidth={2}>
          <Path
            transform="matrix(1,0,0,1,0.158685,0)"
            d="M4.989,14.038L11.361,14.038"
          />
          <Path
            transform="matrix(0,1,-1,0,22.371,5.86282)"
            d="M4.989,14.038L11.361,14.038"
          />
        </G>
      )}
    </G>
  );
}

function Shot2cl({ strong, ...props }: Props & { strong: boolean }) {
  return (
    <Frame viewBox={SHOT_BOX} {...props}>
      <G transform={SHOT_2CL_OFFSET}>
        <Glass2cl strong={strong} />
      </G>
    </Frame>
  );
}

function Shot4cl({ strong, ...props }: Props & { strong: boolean }) {
  return (
    <Frame viewBox={SHOT_BOX} {...props}>
      <Glass4cl strong={strong} />
    </Frame>
  );
}

// Simpel-knappens shot: glasset fylder kun den nederste halvdel af rammen,
// så det læses som et lille shotglas ved siden af flasken og cocktailglasset
// og står på samme bundlinje som dem. Stregen er gjort tykkere, så den
// matcher de to andre ikoner efter formindskelsen.
function ShotSimple(props: Props) {
  return (
    <Frame viewBox={[-7, -21, 28, 42]} {...props}>
      <Glass2cl strong={false} weight={1.8} />
    </Frame>
  );
}

// --- Opslag --------------------------------------------------------------

export function DrinkIcon({
  icon,
  height,
  color,
}: Props & { icon: DrinkIconKey }) {
  const p = { height, color };
  switch (icon) {
    case "bottle":
      return <Bottle {...p} />;
    case "mug":
      return <Mug {...p} />;
    case "cocktail":
      return <CocktailSimple {...p} />;
    case "cocktailMild":
      return <CocktailMild {...p} />;
    case "cocktailMedium":
      return <CocktailMedium {...p} />;
    case "cocktailStrong":
      return <CocktailStrong {...p} />;
    case "wine":
      return <Wine {...p} />;
    case "shot":
      return <ShotSimple {...p} />;
    case "shot2":
      return <Shot2cl strong={false} {...p} />;
    case "shot2Strong":
      return <Shot2cl strong {...p} />;
    case "shot4":
      return <Shot4cl strong={false} {...p} />;
    case "shot4Strong":
      return <Shot4cl strong {...p} />;
  }
}

// Cocktailrammen har luft omkring glasset til sugerør og pynt. Den tegnes
// derfor lidt højere, så selve glasset matcher de andre ikoner.
export function iconHeight(icon: DrinkIconKey, base: number): number {
  return icon === "cocktailMild" ||
    icon === "cocktailMedium" ||
    icon === "cocktailStrong"
    ? Math.round(base * 1.2)
    : base;
}
