/**
 * Name generator for NPC autopilot. Species + society aware: an alien race
 * (Vargr, Aslan, Bwap, etc.) always uses its species naming convention, but
 * humans pull from pools flavoured by their society — a Zhodani human sounds
 * distinctly different from a Solomani citizen.
 *
 * Pure data — no rules logic. Pools are credible first-cuts based on the
 * documented naming patterns in the Mongoose Traveller 2022 Core Rulebook +
 * species/society sourcebooks. Marked TODO where a specific sourcebook
 * would let us tighten canon (Solomani Confederation, Zhodani Consulate,
 * K'kree, Hiver Federation). Engine calls generateNpcName(species, society, rng).
 */
import type { SpeciesId } from '../types';
import type { SocietyId } from '../types/society';
import type { Rng } from './dice';

/* ─────────── Imperial human (the default polyglot stew) ─────────── */
const IMPERIAL_FIRST = [
  'Alric', 'Aliyah', 'Amara', 'Anders', 'Anya', 'Arden', 'Astrid',
  'Bren', 'Caius', 'Cassia', 'Cira', 'Damon', 'Dara', 'Davin',
  'Eira', 'Elias', 'Esme', 'Ewan', 'Faye', 'Finn', 'Gemma',
  'Hadrian', 'Hana', 'Idris', 'Ines', 'Ivo', 'Jana', 'Jin',
  'Kade', 'Kaori', 'Kestrel', 'Kira', 'Lars', 'Lena', 'Lior',
  'Mara', 'Mikael', 'Nadia', 'Nikolai', 'Nora', 'Omar', 'Orin',
  'Petra', 'Quill', 'Rasmus', 'Reva', 'Rhys', 'Saana', 'Selim',
  'Sigrid', 'Soren', 'Tama', 'Tariq', 'Tessa', 'Theron', 'Una',
  'Vance', 'Vesna', 'Wren', 'Xander', 'Yara', 'Zara',
];

const IMPERIAL_LAST = [
  'Aalto', 'Akande', 'Bartlett', 'Brandt', 'Caro', 'Castellan',
  'Coppola', 'Damaris', 'Driscoll', 'Eilers', 'Fairhaven',
  'Fischer', 'Gozzi', 'Hadley', 'Hartmann', 'Iliescu', 'Jansen',
  'Kalas', 'Karras', 'Kovac', 'Larkspur', 'Linde', 'Lockhart',
  'Marrok', 'Meriwether', 'Moranis', 'Naismith', 'Okafor',
  'Pendragon', 'Petrov', 'Quentin', 'Reyes', 'Ruskov', 'Sallow',
  'Sato', 'Saxon', 'Skarsgard', 'Solano', 'Strand', 'Talbot',
  'Tarkanian', 'Thorne', 'Ueda', 'Vance', 'Voss', 'Wallenstein',
  'Wexley', 'Yusra', 'Zarek',
];

/* ─────────── Solomani Confederation human ───────────
 * Solomani lean proudly Terran — Anglo / Latin / Romance heritage with
 * occasional classical Greek pulled forward. TODO: refine against the
 * Mongoose Solomani Confederation sourcebook when available. */
const SOLOMANI_FIRST = [
  'Alexandra', 'Andreas', 'Antonia', 'Augusto', 'Beatrice', 'Carlo',
  'Cassandra', 'Clara', 'Damian', 'Demetria', 'Elena', 'Emilio',
  'Eveline', 'Felix', 'Giulia', 'Gustav', 'Helena', 'Hugo',
  'Isabella', 'James', 'Joaquin', 'Julia', 'Konrad', 'Leonora',
  'Lucia', 'Lukas', 'Marcus', 'Maria', 'Matteo', 'Nadia',
  'Olivia', 'Orson', 'Patrice', 'Philip', 'Renata', 'Rufus',
  'Sebastian', 'Simone', 'Sofia', 'Stefan', 'Theresa', 'Tomas',
  'Valentina', 'Viktor', 'Vincent', 'Yelena',
];

const SOLOMANI_LAST = [
  'Alvarez', 'Bauer', 'Bellini', 'Bianchi', 'Boucher', 'Carrillo',
  'Costa', 'D\'Amato', 'Davenport', 'Delacroix', 'Esposito', 'Farkas',
  'Fontaine', 'Garcia', 'Goldberg', 'Hartmann', 'Herrera', 'Holst',
  'Ivanov', 'Jansen', 'Kovacic', 'Lindqvist', 'Lombardi', 'Marchetti',
  'Marston', 'Müller', 'Nakamura', 'Novak', 'O\'Brien', 'Petrescu',
  'Reyes', 'Romano', 'Salvatori', 'Schreiber', 'Silva', 'Sokolov',
  'Tanaka', 'Vasquez', 'Vogel', 'Wallace', 'Wexler', 'Yamada',
];

/* ─────────── Vilani (First Imperium heritage) ───────────
 * Long syllables, formal cadence. Family names traditionally append
 * a lineage suffix (-shum, -dur, -gimi, -ari). Patterns sourced from
 * Mongoose 2022 Core Rulebook examples. */
const VILANI_GIVEN = [
  'Akar', 'Aniis', 'Bardush', 'Daskan', 'Eshamiir', 'Gashan',
  'Higash', 'Ibanu', 'Inushar', 'Kanidur', 'Karaagim', 'Khaaknu',
  'Khaarrgam', 'Lurushu', 'Mishaame', 'Nashanu', 'Ranukaar',
  'Sharkur', 'Sigamur', 'Tagash', 'Uniinii', 'Vashadan', 'Zaarag',
];

const VILANI_LAST = [
  'Akarish', 'Bargash', 'Dushari', 'Enashdur', 'Gimishuk', 'Iladur',
  'Inadgimi', 'Kashemur', 'Khaadur', 'Likhaarum', 'Marishuk',
  'Mishishari', 'Naashidur', 'Pakhaagim', 'Sashugimi', 'Tarukhana',
  'Ushari', 'Vagidur', 'Zaakhana',
];

/* ─────────── Sword Worlder ───────────
 * The Sword Worlds were colonised by Nordic-cultural settlers; their
 * names lean explicitly Norse / Anglo-Saxon. */
const SWORD_WORLDER_FIRST = [
  'Aksel', 'Astrid', 'Bjorn', 'Brynhild', 'Dagmar', 'Eirik', 'Eivind',
  'Erling', 'Frida', 'Gunnar', 'Halvar', 'Hilde', 'Hrothgar', 'Inge',
  'Ingrid', 'Jorund', 'Kari', 'Knut', 'Leif', 'Magnus', 'Olaf',
  'Ragnar', 'Runa', 'Sigrid', 'Sigurd', 'Sven', 'Thorvald', 'Tove',
  'Tyra', 'Ulf', 'Vidar', 'Yrsa',
];

const SWORD_WORLDER_LAST = [
  'Aslaksen', 'Bjornsen', 'Dahl', 'Eklund', 'Falk', 'Halvarsen',
  'Hjelmstad', 'Iversen', 'Knudsen', 'Larsen', 'Lindstrom', 'Magnusson',
  'Norquist', 'Ostberg', 'Ragnarsen', 'Sigurdsdottir', 'Skarsgard',
  'Solberg', 'Strand', 'Sundqvist', 'Thorvaldsen', 'Vinter', 'Wessel',
];

/* ─────────── Zhodani Consulate human ───────────
 * Distinctive consonant clusters and apostrophe-marked compound names.
 * Sourcebook examples include "Iadr Zdiekrenz", "Plietr". Family names
 * tend to be longer compound formations. TODO: refine against the
 * Mongoose Zhodani Consulate sourcebook when available. */
const ZHODANI_FIRST = [
  'Aplats', 'Briel', 'Chizra', 'Driaplo', 'Iadr', 'Iebr', 'Jdarats',
  'Klievr', 'Lyebr', 'Miekz', 'Nyebr', 'Plietr', 'Qjadr', 'Rjebra',
  'Sdarats', 'Tiebr', 'Uzdrats', 'Viadr', 'Yzdrats', 'Zbria',
];

const ZHODANI_LAST = [
  'Aplatiezr', 'Chdratsienz', 'Dlikhianetl', 'Iedrievr',
  'Jdrebienz', 'Klatsdrievr', 'Mpenkrats', 'Nrievrqlandl',
  'Pliebrtdiats', 'Qaplatsienz', 'Sdrievrabdla', 'Tlatsienz',
  'Vrievrlandl', 'Yzdrienz', 'Zdiekrenz',
];

/* ─────────── Vargr (any society) ─────────── */
const VARGR_GIVEN = [
  'Aekhu', 'Aengz', 'Aelloe', 'Aerggur', 'Daerogh', 'Dhuegnae',
  'Ekhuegz', 'Ferzou', 'Garroe', 'Gvegh', 'Khogarz', 'Khoroe',
  'Lerrgho', 'Naegae', 'Ngagh', 'Oerznae', 'Roeknu', 'Sanzudh',
  'Suedznae', 'Toughodz', 'Uengz', 'Vaerg', 'Vodz', 'Yeknae',
];

const VARGR_LINEAGE = [
  'Llaengz', 'Aekhu', 'Khoaesgu', 'Loegnoe', 'Oeknu', 'Ouenghae',
  'Roughenge', 'Sairzdho', 'Vorghaek', 'Zoezsko',
];

/* ─────────── Aslan ─────────── */
const ASLAN_CLAN = [
  'Aroa', 'Hkir', 'Ihatei', 'Khaukhei', 'Khtoufyeer', 'Kteiroa',
  'Roaiyoesoraf', 'Sruirtleya', 'Tlaiowaha', 'Yerlyaru',
];

const ASLAN_GIVEN = [
  'Aiyusyolei', 'Atykhia', 'Eirelaow', 'Ftahekhuk', 'Hriroa',
  'Khaileiwa', 'Lyeur', 'Tueti', 'Uakhtorl', 'Yelekhi',
];

/* ─────────── Bwap ───────────
 * Bwap names are short, formal, and end in vowel sounds. They take
 * the bureau / paperwork-section name as a personal identifier in
 * formal contexts. Single-name with optional bureau prefix. */
const BWAP_GIVEN = [
  'Aabwa', 'Bopo', 'Dwaba', 'Eepu', 'Fawo', 'Gwabo', 'Hubwap',
  'Iboa', 'Jwapi', 'Kwaba', 'Lobwa', 'Mubwa', 'Nwapu', 'Obawa',
  'Pwabu', 'Quwap', 'Rwabo', 'Subwa', 'Twapa', 'Uwabi', 'Wabwa',
];

/* ─────────── Luriani ─────────── */
const LURIANI_GIVEN = [
  'Aelua', 'Caia', 'Drelia', 'Erun', 'Fhalan', 'Hael', 'Ilun',
  'Kael', 'Liarn', 'Maru', 'Naelu', 'Phari', 'Selia', 'Taara',
  'Vael', 'Yuna', 'Zhael',
];

const LURIANI_LAST = [
  'Adoreth', 'Caenmor', 'Drelvain', 'Eluvar', 'Halendrel',
  'Inurail', 'Maelvor', 'Nuvain', 'Sirethan', 'Tarendil',
  'Vaelmoreth', 'Yarendil',
];

/* ─────────── Jonkeereen ─────────── */
const JONKEEREEN_GIVEN = [
  'Akkir', 'Berran', 'Coriel', 'Demar', 'Ferran', 'Gellis',
  'Hadran', 'Ivak', 'Jaren', 'Karil', 'Loran', 'Merran',
  'Norvik', 'Orran', 'Perok', 'Rallin', 'Sarran', 'Talmar',
  'Veron', 'Yarol',
];

const JONKEEREEN_LAST = [
  'Anharr', 'Barranth', 'Coriendar', 'Drevok', 'Ferrandi',
  'Halmar', 'Ivarrik', 'Jarendar', 'Korvath', 'Merrandi',
  'Norvarr', 'Perranth', 'Salendar', 'Tarvik', 'Vorrenth',
];

const pick = <T>(pool: T[], rng: Rng): T => pool[Math.floor(rng() * pool.length)] ?? pool[0]!;

/**
 * Generate a random NPC name.
 *
 * Resolution order:
 *  1. Distinct species first (Vargr, Aslan, Vilani, Sword Worlder, Bwap,
 *     Luriani, Jonkeereen) — their naming conventions are biologically /
 *     culturally specific and dominate over wherever they live.
 *  2. Otherwise (species: human or solomani), the society shapes the pool —
 *     Solomani Confederation pulls Terran-heritage names, Zhodani Consulate
 *     pulls Zhodani-pattern, the Two Thousand Worlds adopts adjacent
 *     conventions, and everywhere else uses the Imperial polyglot stew.
 */
export function generateNpcName(
  species: SpeciesId,
  society: SocietyId | undefined,
  rng: Rng = Math.random,
): string {
  // Species-driven first.
  switch (species) {
    case 'vargr':
      return `${pick(VARGR_GIVEN, rng)} ${pick(VARGR_LINEAGE, rng)}`;
    case 'aslan':
      return `${pick(ASLAN_GIVEN, rng)} ${pick(ASLAN_CLAN, rng)}`;
    case 'vilani':
      return `${pick(VILANI_GIVEN, rng)} ${pick(VILANI_LAST, rng)}`;
    case 'sword_worlder':
      return `${pick(SWORD_WORLDER_FIRST, rng)} ${pick(SWORD_WORLDER_LAST, rng)}`;
    case 'bwap':
      return pick(BWAP_GIVEN, rng); // Bwap use a single-name; bureau prefix is contextual.
    case 'luriani':
      return `${pick(LURIANI_GIVEN, rng)} ${pick(LURIANI_LAST, rng)}`;
    case 'jonkeereen':
      return `${pick(JONKEEREEN_GIVEN, rng)} ${pick(JONKEEREEN_LAST, rng)}`;
    case 'solomani':
      return `${pick(SOLOMANI_FIRST, rng)} ${pick(SOLOMANI_LAST, rng)}`;
    case 'human':
    default:
      break; // fall through to society-driven naming
  }
  // Society-driven for generic Human.
  switch (society) {
    case 'solomani_confederation':
      return `${pick(SOLOMANI_FIRST, rng)} ${pick(SOLOMANI_LAST, rng)}`;
    case 'zhodani_consulate':
      return `${pick(ZHODANI_FIRST, rng)} ${pick(ZHODANI_LAST, rng)}`;
    case 'vargr_extents':
      // Imperium-raised humans in Vargr space typically keep their Imperial
      // names but pick up Vargr-style lineage markers. Approximated as
      // Imperial first / Vargr-leaning last for flavour.
      return `${pick(IMPERIAL_FIRST, rng)} ${pick(VARGR_LINEAGE, rng)}`;
    case 'aslan_hierate':
      // Hierate-resident humans take aslan-flavoured clan associations.
      return `${pick(IMPERIAL_FIRST, rng)} ${pick(ASLAN_CLAN, rng)}`;
    case 'two_thousand_worlds':
    case 'hiver_federation':
    case 'third_imperium':
    case 'other':
    case undefined:
    default:
      return `${pick(IMPERIAL_FIRST, rng)} ${pick(IMPERIAL_LAST, rng)}`;
  }
}
