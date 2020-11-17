import { by, element, expect, device } from "detox"
import { APISignUpMentee, APISignUpMentor, APIDeleteAccounts, scrollDownAndTap, waitAndTypeText, signIn } from './helpers'

const accountFixtures = require('./fixtures/accounts.json')


describe('Chat', () => {
    beforeEach(async () => {
        await APIDeleteAccounts();
        await device.reloadReactNative();
        await device.disableSynchronization();
    })

    it('with new mentor', async () => {
        const mentee = accountFixtures.mentees[0];
        await APISignUpMentee(mentee);
        const mentor = accountFixtures.mentors[0];
        await APISignUpMentor(mentor);

        await signIn(mentee);
        await scrollDownAndTap('onboarding.selectTopic.skip', 'onboarding.selectTopic.view');

        await element(by.text('Read more')).tap();
        await element(by.text('Chat')).tap();

        await waitAndTypeText('main.chat.input.input', "Hi mentor!");
        await element(by.text('main.chat.input.button')).tap();

        //TODO: expect something
    });
});
