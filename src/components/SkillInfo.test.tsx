import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SkillInfoCard, SkillInfoButton } from './SkillInfo';

describe('SkillInfoCard', () => {
  it('renders description and example checks for a skill', () => {
    render(<SkillInfoCard name="Admin" />);
    expect(screen.getByText(/Bureaucracies/)).toBeInTheDocument();
    expect(screen.getByText(/Avoid close examination of papers/)).toBeInTheDocument();
    expect(screen.getByText(/Average \(8\+\)/)).toBeInTheDocument();
  });

  it('lists specializations when no spec is selected', () => {
    render(<SkillInfoCard name="Drive" />);
    expect(screen.getByText('hovercraft')).toBeInTheDocument();
    expect(screen.getByText('walker')).toBeInTheDocument();
    expect(screen.getByText(/cushion of air/)).toBeInTheDocument();
  });

  it('shows the spec-specific description when a spec is given', () => {
    render(<SkillInfoCard name="Engineer" spec="j-drive" />);
    expect(screen.getByText('Engineer (j-drive)')).toBeInTheDocument();
    expect(screen.getByText(/jump drive/)).toBeInTheDocument();
  });

  it('flags Jack-of-all-Trades as not trainable', () => {
    render(<SkillInfoCard name="Jack-of-all-Trades" />);
    expect(screen.getByText(/Not trainable/)).toBeInTheDocument();
  });
});

describe('SkillInfoButton', () => {
  it('toggles a popover with the skill info', async () => {
    const user = userEvent.setup();
    render(<SkillInfoButton name="Stealth" />);

    expect(screen.queryByText(/Staying unseen/)).not.toBeInTheDocument();
    await user.click(screen.getByLabelText('Info about Stealth'));
    expect(screen.getByText(/Staying unseen/)).toBeInTheDocument();
    await user.click(screen.getByLabelText('Close'));
    expect(screen.queryByText(/Staying unseen/)).not.toBeInTheDocument();
  });
});
