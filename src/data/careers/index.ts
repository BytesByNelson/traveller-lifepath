import type { Career, CareerId } from '../../types';
import { agent } from './agent';
import { army } from './army';
import { citizen } from './citizen';
import { drifter } from './drifter';
import { entertainer } from './entertainer';
import { marine } from './marine';
import { merchant } from './merchant';
import { navy } from './navy';
import { noble } from './noble';
import { prisoner } from './prisoner';
import { psion } from './psion';
import { rogue } from './rogue';
import { scholar } from './scholar';
import { scout } from './scout';

export const CAREERS: Record<CareerId, Career> = {
  agent,
  army,
  citizen,
  drifter,
  entertainer,
  marine,
  merchant,
  navy,
  noble,
  prisoner,
  psion,
  rogue,
  scholar,
  scout,
};

export const CAREER_LIST: Career[] = Object.values(CAREERS);
