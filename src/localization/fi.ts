/*eslint sort-keys: "error"*/
export const messages = {
  'buddyList.title': 'Keskustelut',

  'components.appTitle.subTitle': 'MentorApp',
  'components.appTitle.title': 'Ylitse',

  'components.createdBySosBanner': 'Palvelun tarjoaa SOS-lapsikylä',

  'components.mentorCard.readMore': 'Lue Lisää',
  'components.mentorCard.showMore': 'Näytä lisää...',
  'components.mentorCard.yearsAbbrev': 'v.',

  'components.mentorSkills.title': 'Voin auttaa',
  'components.mentorStory.title': 'Tietoja minusta',

  'components.remoteData.loading': 'Ladataan...',
  'components.remoteData.loadingFailed': 'Lataus epäonnistui',
  'components.remoteData.retry': 'Yritä uudelleen',

  'main.mentorCardExpanded.button': 'Juttele',
  'main.mentorList.title': 'Mentorit',

  'onboarding.mentorlist.lowerTitle': 'Mentorimme',
  'onboarding.mentorlist.start': 'Aloita',
  'onboarding.mentorlist.upperTitle': 'Tapaa',

  'onboarding.signIn.button': 'Kirjaudu',
  'onboarding.signIn.failure': 'Kirjautumien epäonnistui',
  'onboarding.signIn.title': 'Kirjaudu',

  'onboarding.signUp.back': 'Takaisin',
  'onboarding.signUp.errorMessageId': 'Käyttäjänimi on varattu',
  'onboarding.signUp.existingAccount.login': 'Kirjaudu sisään',
  'onboarding.signUp.existingAccount.title': 'Minulla on jo tunnus',
  'onboarding.signUp.nickName': 'Nikki',
  'onboarding.signUp.password': 'Salasana',
  'onboarding.signUp.signUp': 'Luo tunnus',
  'onboarding.signUp.title': 'Luo tunnus',
};

export type MessageId = keyof typeof messages;
