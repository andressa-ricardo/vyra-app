import { getInitials } from './initials';

describe('getInitials', () => {
  it.each([
    ['Julia Andrade', 'JA'],
    ['julia maria andrade', 'JA'],
    ['Julia', 'J'],
    ['  ', ''],
  ])('%s → %s', (name, initials) => {
    expect(getInitials(name)).toBe(initials);
  });
});
