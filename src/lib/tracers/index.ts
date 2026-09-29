import type { Tracer } from "../types";
import * as F from "./flagship";
import * as G from "./greedy";
import * as H from "./hashing";
import * as S from "./searching";
import * as T from "./twoPointers";
import * as W from "./windows";

export const TRACERS: Record<string, Tracer> = {
  "kadane-brute": F.kadaneBrute,
  "kadane-improved": F.kadaneImproved,
  "kadane-optimal": F.kadaneOptimal,
  "negatives-brute": F.negativesBrute,
  "negatives-improved": F.negativesImproved,
  "negatives-optimal": F.negativesOptimal,
  "pairs-brute": F.pairsBrute,
  "pairs-improved": F.pairsImproved,
  "pairs-optimal": F.pairsOptimal,
  reverse: T.reverseTracer,
  dnf012: T.dnf012Tracer,
  threeWay: T.threeWayTracer,
  alternating: T.alternatingTracer,
  mergeGap: T.mergeGapTracer,
  rotateOne: T.rotateOneTracer,
  palindromeOps: T.palindromeOpsTracer,
  trapping: T.trappingTracer,
  floyd: T.floydTracer,
  unionInter: T.unionInterTracer,
  common3: T.common3Tracer,
  triplet: T.tripletTracer,
  smallestSub: W.smallestSubTracer,
  maxProduct: W.maxProductTracer,
  minSwapsK: W.minSwapsKTracer,
  stockOnce: W.stockOnceTracer,
  zeroSum: H.zeroSumTracer,
  longestConsec: H.longestConsecTracer,
  nByK: H.nByKTracer,
  subset: H.subsetTracer,
  maxMin: S.maxMinTracer,
  quickselect: S.quickselectTracer,
  inversions: S.inversionsTracer,
  median: S.medianTracer,
  chocolate: S.chocolateTracer,
  heights: G.heightsTracer,
  jumps: G.jumpsTracer,
  intervals: G.intervalsTracer,
  nextPerm: G.nextPermTracer,
  profitTwice: G.profitTwiceTracer,
  factorial: G.factorialTracer,
};
