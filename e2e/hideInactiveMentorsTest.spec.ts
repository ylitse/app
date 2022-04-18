import { by, element, expect, device } from 'detox';
import {
  describe,
  it,
  beforeEach,
  beforeAll,
  expect as jestExpect,
} from '@jest/globals';

import {
  APISignUpMentee,
  APIDeleteAccounts,
  APISignUpMentor,
  signIn,
  forceLogout,
} from './helpers';

const accountFixtures = require('./fixtures/accounts.json');

const findMentor = async (mentorIndexes: any, mentorsFound: any) => {
  let found = { ...mentorsFound };
  for (let i in mentorIndexes) {
    try {
      await expect(
        element(by.text(accountFixtures.mentors[i].displayName)),
      ).toBeVisible();
      found[accountFixtures.mentors[i].displayName] = true;
    } catch (error) {
      continue;
    }
  }

  return found;
};
describe('Hide inactive mentors', () => {
  beforeAll(async () => {
    await device.launchApp();
  });
  beforeEach(async () => {
    await APIDeleteAccounts();
    await forceLogout();
  });

  it('Hide inactive mentors by default', async () => {
    await APISignUpMentor(accountFixtures.mentors[0]);
    await APISignUpMentor(accountFixtures.mentors[1]);
    await APISignUpMentor(accountFixtures.mentors[2]);

    const mentee = accountFixtures.mentees[0];
    await APISignUpMentee(mentee);
    await signIn(mentee);

    // Try to find a mentor from 3 possibilities. Swipe and repeat.
    // 3 mentors so we need 2 swipes.
    let mentorsFound = {
      [accountFixtures.mentors[0].displayName]: false,
      [accountFixtures.mentors[1].displayName]: false,
      [accountFixtures.mentors[2].displayName]: false,
    };
    const mentorIndexes = [0, 1, 2];
    mentorsFound = await findMentor(mentorIndexes, mentorsFound);

    await element(by.id('components.mentorList')).swipe('left', 'slow');

    mentorsFound = await findMentor(mentorIndexes, mentorsFound);

    await element(by.id('components.mentorList')).swipe('left', 'slow');

    mentorsFound = await findMentor(mentorIndexes, mentorsFound);

    const expectedMentors = {
      [accountFixtures.mentors[0].displayName]: true,
      [accountFixtures.mentors[1].displayName]: true,
      [accountFixtures.mentors[2].displayName]: false, // Third mentor is on vacation
    };
    jestExpect(mentorsFound).toEqual(expectedMentors);
  });

  it('Show inactive mentors', async () => {
    await APISignUpMentor(accountFixtures.mentors[0]);
    await APISignUpMentor(accountFixtures.mentors[1]);
    await APISignUpMentor(accountFixtures.mentors[2]);

    const mentee = accountFixtures.mentees[0];
    await APISignUpMentee(mentee);
    await signIn(mentee);

    await element(by.id('main.mentorsTitleAndSearchButton')).tap();
    await element(by.id('main.searchMentor.hideInactiveMentors')).tap();
    await element(by.id('main.searchMentor.showButton')).tap();

    // Try to find a mentor from 3 possibilities. Swipe and repeat.
    // 3 mentors so we need 2 swipes.
    let mentorsFound = {
      [accountFixtures.mentors[0].displayName]: false,
      [accountFixtures.mentors[1].displayName]: false,
      [accountFixtures.mentors[2].displayName]: false,
    };
    const mentorIndexes = [0, 1, 2];
    mentorsFound = await findMentor(mentorIndexes, mentorsFound);

    await element(by.id('components.mentorList')).swipe('left', 'slow');

    mentorsFound = await findMentor(mentorIndexes, mentorsFound);

    await element(by.id('components.mentorList')).swipe('left', 'slow');

    mentorsFound = await findMentor(mentorIndexes, mentorsFound);

    const expectedMentors = {
      [accountFixtures.mentors[0].displayName]: true,
      [accountFixtures.mentors[1].displayName]: true,
      [accountFixtures.mentors[2].displayName]: true, // Third mentor is on vacation, but show anyway
    };
    jestExpect(mentorsFound).toEqual(expectedMentors);
  });
});
