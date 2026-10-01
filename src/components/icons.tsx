// Ikoner til knapperne. Flasken og pynten på cocktails er Caspers egne
// (Affinity-eksport), shotglassene er tegnet til appen, og resten er Lucide.
// Stregen følger den farve, der gives med.
//
// Ikoner i samme familie deler viewBox, så størrelsesforholdet mellem dem
// er geometri og ikke noget, der skal justeres pr. knap:
//   shots     24×24. 2 cl-glasset er lavt, 4 cl-glasset højt, samme bund.
//   cocktails fælles ramme om det samme glas; sugerør og pynt rager ud.

import type { ReactNode } from "react";
import Svg, { G, Path } from "react-native-svg";
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

// Shotglas i samme gitter og streg som vinglasset og cocktailglasset (24×24,
// streg 2). Glasset har lige, skrå sider og en tyk bund.
//
// Alm. og Stærk er hinandens modsætning: på Alm. er bunden farvet ind og
// indholdet tomt, på Stærk er indholdet farvet ind helt op til kanten og
// bunden tom. 2 cl er et lavt glas, 4 cl et højere.
type ShotShape = {
  glass: string;
  // Den farvede flade.
  fill: string;
  // Stregen mellem indhold og bund, kun på Stærk.
  line?: string;
};

const SHOT_2CL: ShotShape = {
  glass: "M7.6 9h8.8l-1 10.1a1 1 0 0 1-1 .9H9.6a1 1 0 0 1-1-.9z",
  fill: "M8.41 17.2H15.59L15.4 19.1a1 1 0 0 1-1 .9H9.6a1 1 0 0 1-1-.9z",
};

const SHOT_2CL_STRONG: ShotShape = {
  glass: SHOT_2CL.glass,
  fill: "M7.6 9H16.4L15.73 15.8H8.27z",
  line: "M8.3 15.8h7.4",
};

const SHOT_4CL: ShotShape = {
  glass: "M6 4h12l-1.4 15.1a1 1 0 0 1-1 .9H8.4a1 1 0 0 1-1-.9z",
  fill: "M7.11 16H16.89L16.6 19.1a1 1 0 0 1-1 .9H8.4a1 1 0 0 1-1-.9z",
};

const SHOT_4CL_STRONG: ShotShape = {
  glass: SHOT_4CL.glass,
  fill: "M6 4H18L16.89 16H7.11z",
  line: "M7.1 16h9.8",
};

// Simpel-knappens shot: et glas midt imellem de to størrelser.
const SHOT_SIMPLE: ShotShape = {
  glass: "M6.6 6.5h10.8l-1.2 12.6a1 1 0 0 1-1 .9H8.8a1 1 0 0 1-1-.9z",
  fill: "M7.5 16H16.5L16.2 19.1a1 1 0 0 1-1 .9H8.8a1 1 0 0 1-1-.9z",
};

function Shot({ shape, ...props }: Props & { shape: ShotShape }) {
  return (
    <Frame viewBox={[0, 0, 24, 24]} {...props}>
      <G strokeWidth={2}>
        <Path d={shape.glass} />
        {shape.line && <Path d={shape.line} />}
        <Path d={shape.fill} fill={props.color} />
      </G>
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
      return <Shot shape={SHOT_SIMPLE} {...p} />;
    case "shot2":
      return <Shot shape={SHOT_2CL} {...p} />;
    case "shot2Strong":
      return <Shot shape={SHOT_2CL_STRONG} {...p} />;
    case "shot4":
      return <Shot shape={SHOT_4CL} {...p} />;
    case "shot4Strong":
      return <Shot shape={SHOT_4CL_STRONG} {...p} />;
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
