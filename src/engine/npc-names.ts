/**
 * Name generator for NPC autopilot. Three pools — Imperium-flavoured human
 * names (drawing from a mix of Earth-cultural sources to feel like the broad
 * stew of Charted Space), Vargr (heavy consonants + clan suffix per the
 * Mongoose 2022 species write-up), and Aslan (clan-prefix + given name).
 *
 * Pure data — no rules logic. Engine calls generateNpcName(species, rng).
 */
import type { SpeciesId } from '../types';
import type { Rng } from './dice';

const HUMAN_FIRST = [
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

const HUMAN_LAST = [
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

const ASLAN_CLAN = [
  'Aroa', 'Hkir', 'Ihatei', 'Khaukhei', 'Khtoufyeer', 'Kteiroa',
  'Roaiyoesoraf', 'Sruirtleya', 'Tlaiowaha', 'Yerlyaru',
];

const ASLAN_GIVEN = [
  'Aiyusyolei', 'Atykhia', 'Eirelaow', 'Ftahekhuk', 'Hriroa',
  'Khaileiwa', 'Lyeur', 'Tueti', 'Uakhtorl', 'Yelekhi',
];

const pick = <T>(pool: T[], rng: Rng): T => pool[Math.floor(rng() * pool.length)] ?? pool[0]!;

/** Generate a random NPC name. Species-aware. */
export function generateNpcName(species: SpeciesId, rng: Rng = Math.random): string {
  switch (species) {
    case 'vargr':
      return `${pick(VARGR_GIVEN, rng)} ${pick(VARGR_LINEAGE, rng)}`;
    case 'aslan':
      return `${pick(ASLAN_GIVEN, rng)} ${pick(ASLAN_CLAN, rng)}`;
    case 'human':
    default:
      return `${pick(HUMAN_FIRST, rng)} ${pick(HUMAN_LAST, rng)}`;
  }
}
