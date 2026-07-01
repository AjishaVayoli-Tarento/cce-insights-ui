import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import * as axeMatchers from 'vitest-axe/matchers';
import { StatusBadge } from '../components/shared/StatusBadge';
import { EmptyState } from '../components/shared/EmptyState';

expect.extend(axeMatchers);

/**
 * Automated accessibility checks (axe-core via vitest-axe) for shared presentational components,
 * plus explicit accessible-attribute assertions. Landmark/region rules are disabled because these
 * are isolated component fragments, not full pages (those rules belong to page-level E2E).
 */
describe('accessibility — shared components', () => {
  // region: isolated fragments aren't in a landmark (page-level concern).
  // color-contrast: needs a real canvas/layout engine — not evaluable in jsdom; check it at the
  // browser-E2E layer (Playwright) once/if that is added.
  const componentRules = {
    rules: { region: { enabled: false }, 'color-contrast': { enabled: false } },
  };

  it('StatusBadge has no axe violations', async () => {
    const { container } = render(
      <StatusBadge label="OVERDUE" color={{ bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' }} />,
    );
    expect(await axe(container, componentRules)).toHaveNoViolations();
  });

  it('EmptyState has no axe violations and exposes its title as a heading', async () => {
    const { container } = render(
      <EmptyState title="No deviations found" description="Try widening the date range" />,
    );
    expect(await axe(container, componentRules)).toHaveNoViolations();
    // The title must be a real heading for screen-reader navigation, not just styled text.
    expect(screen.getByRole('heading', { name: 'No deviations found' })).toBeInTheDocument();
  });
});
