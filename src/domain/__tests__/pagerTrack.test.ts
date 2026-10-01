import { EARLY, alongTrack, buildTrack } from "../pagerTrack";

const W = 400;

describe("sporet mellem knappanelerne", () => {
  test("før panelerne er målt, følger alt fingeren jævnt", () => {
    const track = buildTrack([null, null, null], W);
    expect(track.input).toEqual([0, W, 2 * W]);
    expect(track.pages).toEqual([0, 1, 2]);
  });

  test("på vej mod et højere panel nås højden tidligt", () => {
    const track = buildTrack([100, 230], W);
    expect(track.input).toEqual([0, EARLY * W, W]);
    expect(alongTrack(track, [100, 230])).toEqual([100, 230, 230]);
  });

  test("på vej væk fra et højere panel holdes højden længe", () => {
    const track = buildTrack([230, 100], W);
    expect(track.input).toEqual([0, (1 - EARLY) * W, W]);
    expect(alongTrack(track, [230, 100])).toEqual([230, 230, 100]);
  });

  test("lige høje paneler får ingen ekstra punkter", () => {
    expect(buildTrack([230, 230.2], W).input).toEqual([0, W]);
  });

  test("tre paneler: lavt, højt, lidt lavere", () => {
    const track = buildTrack([118, 233, 163], W);
    expect(track.input).toEqual([0, EARLY * W, W, (2 - EARLY) * W, 2 * W]);
    expect(alongTrack(track, [118, 233, 163])).toEqual([118, 233, 233, 233, 163]);
    // Positionerne skal stige hele vejen, ellers kan de ikke bruges.
    for (let i = 1; i < track.input.length; i++) {
      expect(track.input[i]).toBeGreaterThan(track.input[i - 1]);
    }
  });

  test("andre værdier følger samme spor", () => {
    const track = buildTrack([118, 233, 233], W);
    // Uglens skala: stor i Simpel, lille i de to andre.
    expect(alongTrack(track, [1.35, 0.6, 0.6])).toEqual([1.35, 0.6, 0.6, 0.6]);
  });
});
