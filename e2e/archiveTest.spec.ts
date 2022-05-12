import { by, element, expect, device, waitFor } from 'detox';
import { describe, it, beforeEach } from '@jest/globals';

import {
  APISignUpMentee,
  APISignUpMentor,
  APIDeleteAccounts,
  signIn,
  waitAndTypeText,
  forceLogout,
  APIBan,
} from './helpers';

const accountFixtures = require('./fixtures/accounts.json');

describe('Archiving', () => {
  beforeEach(async () => {
    await APIDeleteAccounts();
    await device.launchApp();
    await device.reloadReactNative();
  });

  it('can archive a contact', async () => {
    const mentor = accountFixtures.mentors[1];
    await APISignUpMentor(mentor);
    const mentee = accountFixtures.mentees[0];
    await APISignUpMentee(mentee);

    // mentee sends a msg to mentor
    await signIn(mentee);

    await element(by.text('Read more')).tap();
    await element(by.text('Chat')).tap();

    await waitAndTypeText('main.chat.input.input', 'Hi', true);
    await element(by.id('main.chat.input.button')).tap();

    await forceLogout();

    // mentor side
    await signIn(mentor);

    // not arhived yet, should show new message indicator
    await expect(element(by.id('main.tabs.unseenDot'))).toBeVisible();
    await element(by.id('tabs.chats')).tap();
    await expect(
      element(by.id('main.buddyList.button.unseenDot')),
    ).toBeVisible();

    // mentor archives the mentee
    await element(by.text(mentee.displayName)).atIndex(0).tap();
    await element(by.id('main.chat.title.kebabicon')).tap();
    await element(by.text('Archive chat')).tap();
    await element(by.text('OK')).tap();

    await expect(element(by.text(mentee.displayName))).toBeNotVisible();

    await element(by.id('main.buddylist.kebabicon')).tap();
    await element(by.text('Archived')).tap();

    await expect(element(by.text(mentee.displayName))).toBeVisible();

    await forceLogout();

    // mentee sends another msg to mentor
    await signIn(mentee);
    await element(by.text('Read more')).tap();
    await element(by.text('Chat')).tap();
    await waitAndTypeText('main.chat.input.input', 'Notice me Senpai!', true);
    await element(by.id('main.chat.input.button')).tap();
    await forceLogout();

    // mentor should not see new message indicator
    await signIn(mentor);
    await expect(element(by.id('main.tabs.unseenDot'))).toBeNotVisible();
    await element(by.id('tabs.chats')).tap();
    await element(by.id('main.buddylist.kebabicon')).tap();
    await element(by.text('Archived')).tap();
    await expect(
      element(by.id('main.buddyList.button.unseenDot')),
    ).toBeNotVisible();

    // but new msg should still be there
    await element(by.text(mentee.displayName)).atIndex(0).tap();
    await expect(
      element(by.text('Notice me Senpai!')).atIndex(1),
    ).toBeVisible();
    await forceLogout();
  });

  it('can restore archived contact', async () => {
    const mentor = accountFixtures.mentors[1];
    await APISignUpMentor(mentor);
    const mentee = accountFixtures.mentees[0];
    await APISignUpMentee(mentee);

    await signIn(mentee);

    await element(by.text('Read more')).tap();
    await element(by.text('Chat')).tap();

    await waitAndTypeText('main.chat.input.input', 'Hi', true);
    await element(by.id('main.chat.input.button')).tap();

    await forceLogout();

    await APIBan(mentor, mentee, 'archived');

    await signIn(mentor);

    await element(by.id('tabs.chats')).tap();

    await element(by.id('main.buddylist.kebabicon')).tap();
    await element(by.text('Archived')).tap();

    await element(by.text(mentee.displayName)).tap();

    await element(by.id('main.chat.title.kebabicon')).tap();
    await element(by.text('Restore chat')).tap();

    await element(by.text('OK')).tap();

    await waitFor(element(by.id('main.archivedList.back.button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('main.archivedList.back.button')).tap();

    await expect(element(by.text(mentee.displayName))).toBeVisible();

    await forceLogout();
  });

  it('can delete archived contact', async () => {
    const mentor = accountFixtures.mentors[1];
    await APISignUpMentor(mentor);
    const mentee = accountFixtures.mentees[0];
    await APISignUpMentee(mentee);

    await signIn(mentee);

    await element(by.text('Read more')).tap();
    await element(by.text('Chat')).tap();

    await waitAndTypeText('main.chat.input.input', 'Hi', true);
    await element(by.id('main.chat.input.button')).tap();

    await forceLogout();

    await APIBan(mentor, mentee, 'archived');

    await signIn(mentor);

    await element(by.id('tabs.chats')).tap();

    await element(by.id('main.buddylist.kebabicon')).tap();
    await element(by.text('Archived')).tap();

    await element(by.text(mentee.displayName)).tap();

    await element(by.id('main.chat.title.kebabicon')).tap();
    await element(by.text('Delete chat')).tap();

    await element(by.text('OK')).tap();

    // mentor should not see mentee's name in archived list
    await expect(element(by.text(mentee.displayName))).toBeNotVisible();

    await waitFor(element(by.id('main.archivedList.back.button')))
      .toBeVisible()
      .withTimeout(5000);
    await element(by.id('main.archivedList.back.button')).tap();

    // mentor should not see mentee's name in chats list
    await expect(element(by.text(mentee.displayName))).toBeNotVisible();

    await forceLogout();

    // mentee can send another msg to mentor
    await signIn(mentee);
    await element(by.text('Read more')).tap();
    await element(by.text('Chat')).tap();
    await waitAndTypeText('main.chat.input.input', 'Notice me Senpai!', true);
    await element(by.id('main.chat.input.button')).tap();
    await forceLogout();

    // mentor should not see new message indicator
    await signIn(mentor);
    await expect(element(by.id('main.tabs.unseenDot'))).toBeNotVisible();
    await element(by.id('tabs.chats')).tap();
    await element(by.id('main.buddylist.kebabicon')).tap();
    await element(by.text('Archived')).tap();
    await expect(
      element(by.id('main.buddyList.button.unseenDot')),
    ).toBeNotVisible();

    // mentor should not see mentee's name in chats list
    await expect(element(by.text(mentee.displayName))).toBeNotVisible();

    await forceLogout();
  });
});