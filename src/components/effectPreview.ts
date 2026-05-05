import type { Effect, SkillRef } from '../types';

const assertNever = (e: never): never => {
  throw new Error(`Unhandled effect type: ${JSON.stringify(e)}`);
};

/**
 * Short, single-line description of an Effect — used for previewing skill table rows
 * and similar lookup-style outcomes. Falls back to a generic label when the effect
 * needs runtime context to describe (e.g. nested checks, table rerolls).
 */
export function summarizeEffect(effect: Effect): string {
  switch (effect.type) {
    case 'gain_skill':
      return `${skillLabel(effect.skill)}${typeof effect.level === 'number' ? ` ${effect.level}` : ''}`;
    case 'gain_skill_choice':
      if (effect.from && effect.from.length > 0) {
        return `Pick: ${effect.from.map(skillLabel).join(' / ')}${effect.level ? ` (level ${effect.level})` : ''}`;
      }
      return `Pick any skill${effect.existingOnly ? ' you already have' : ''}${effect.level ? ` (level ${effect.level})` : ''}`;
    case 'modify_char':
      return `${effect.char} ${effect.delta > 0 ? '+' : ''}${effect.delta}`;
    case 'raise_char_to_or_bump':
      return `${effect.char} → at least ${effect.minimum}, else +1`;
    case 'modify_char_choice':
      return `Pick: ${effect.chars.join(' / ')} ${effect.delta > 0 ? '+' : ''}${effect.delta}`;
    case 'modify_char_choice_rolled':
      return `${effect.chars.join(' / ')} ${effect.sign === 'minus' ? '−' : '+'}${effect.dice}`;
    case 'modify_psi':
      return `PSI ${effect.delta > 0 ? '+' : ''}${effect.delta}`;
    case 'gain_connection':
      return `Gain ${effect.connection}`;
    case 'gain_connection_choice':
      return `Gain one of: ${effect.choices.join(' / ')}`;
    case 'choice':
      return effect.options.map((o) => o.label).join(' or ');
    case 'next_advancement_dm':
      return `Next advancement DM ${effect.dm > 0 ? '+' : ''}${effect.dm}`;
    case 'next_qualification_dm':
      return `Next qualification DM ${effect.dm > 0 ? '+' : ''}${effect.dm}`;
    case 'next_survival_dm':
      return `Next survival DM ${effect.dm > 0 ? '+' : ''}${effect.dm}`;
    case 'next_benefit_roll_dm':
      return `Next benefit roll DM ${effect.dm > 0 ? '+' : ''}${effect.dm}`;
    case 'gain_benefit_rolls':
      return `+${effect.count} benefit roll${effect.count === 1 ? '' : 's'}`;
    case 'lose_benefit_rolls':
      return effect.count === 'all' ? 'Lose all benefit rolls' : `Lose ${effect.count} benefit roll${effect.count === 1 ? '' : 's'}`;
    case 'gain_benefit':
      return `Benefit: ${effect.benefit.type.replace(/_/g, ' ')}`;
    case 'gain_ship_share':
      return `Ship share`;
    case 'auto_promote':
      return 'Automatic promotion';
    case 'auto_commission':
      return 'Automatic commission';
    case 'eject_career':
      return 'Ejected from career';
    case 'must_continue_career':
      return 'Must continue this career';
    case 'force_career':
      return `Forced into ${effect.career} next term`;
    case 'force_draft':
      return 'Drafted next term';
    case 'extra_skill_roll':
      return `+${effect.count} bonus skill roll${effect.count === 1 ? '' : 's'}`;
    case 'roll_on_table':
      return `Roll on ${effect.table.kind.replace(/_/g, ' ')}`;
    case 'roll_on_other_career_events':
      return `Roll on ${effect.career} events`;
    case 'roll_on_other_career_mishap':
      return `Roll on ${effect.career} mishap`;
    case 'roll_on_other_career_assignment_skill_table':
      return `Roll on ${effect.career} skill table`;
    case 'note':
      return effect.text;
    case 'gain_psion_eligibility':
      return 'Become eligible to test PSI';
    case 'allow_career_without_qualification':
      return `${effect.career} without qualification next term`;
    case 'force_fail_pre_career_graduation':
      return 'Fail to graduate this term';
    case 'prisoner_on_natural_two':
      return 'Roll 2D — on natural 2, Prisoner career next term';
    case 'check':
      return effect.description ?? `${rollCheckLabel(effect.roll)} ${effect.roll.target}+ check`;
    case 'wager_benefit_rolls':
      return `Wager benefit rolls — ${rollCheckLabel(effect.check)} ${effect.check.target}+`;
    case 'gain_injury':
      return `Injury: ${effect.description}`;
    case 'convert_connection':
      return `Convert ${effect.from.join('/')} → ${effect.to.join('/')}`;
    case 'modify_parole_threshold':
      return `Parole threshold ${effect.delta > 0 ? '+' : ''}${effect.delta}`;
    case 'reroll_parole_threshold':
      return 'Reroll parole threshold';
  }
  return assertNever(effect);
}

const skillLabel = (s: SkillRef): string => `${s.name}${s.spec ? ` (${s.spec})` : ''}`;

const rollCheckLabel = (r: { kind: 'char'; char: string } | { kind: 'skill'; skill: SkillRef; target: number }): string =>
  r.kind === 'char' ? r.char : skillLabel(r.skill);
