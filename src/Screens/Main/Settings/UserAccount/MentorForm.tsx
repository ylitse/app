import React from 'react';
import RN from 'react-native';
import * as redux from 'redux';
import { useDispatch, useSelector } from 'react-redux';

import * as config from '../../../../api/config';
import * as actions from '../../../../state/actions';
import * as mentorState from '../../../../state/reducers/mentors';

import Button from '../../../components/Button';
import Message from '../../../components/Message';
import StatusMessageForm from 'src/Screens/components/StatusMessageForm';
import MessageSwitch from 'src/Screens/components/MessageSwitch';

import colors from '../../../components/colors';
import fonts from '../../../components/fonts';

type Props = {
  userId: string;
};

type MentorUpdateData =
  | {
      is_vacationing: boolean;
    }
  | { status_message: string };

export default ({ userId }: Props) => {
  const { mentor, account, isMentorDataUpdateLoading } = useSelector(
    mentorState.getMentorFormData(userId),
  );

  const [statusMessage, setStatusMessage] = React.useState(
    mentor?.status_message ?? '',
  );

  const dispatch = useDispatch<redux.Dispatch<actions.Action>>();

  const openProfile = () => {
    RN.Linking.openURL(config.loginUrl);
  };

  const updateMentorData = (updateData: MentorUpdateData) => {
    if (!!mentor && !!account) {
      dispatch({
        type: 'mentor/updateMentorData/start',
        payload: { mentor: { ...mentor, ...updateData }, account },
      });
    }
  };

  React.useEffect(() => {
    setStatusMessage(mentor?.status_message ?? '');
  }, [mentor?.status_message]);

  return (
    <>
      <Message
        style={styles.fieldName}
        id="main.settings.account.profile.title"
      />
      <Button
        style={styles.changePasswordButton}
        messageStyle={styles.buttonText}
        onPress={openProfile}
        messageId="main.settings.account.profile.button"
      />
      <Message
        style={styles.fieldName}
        id="main.settings.account.vacation.title"
      />
      <MessageSwitch
        containerStyle={styles.vacationSwitch}
        value={mentor?.is_vacationing ?? false}
        isLoading={isMentorDataUpdateLoading}
        messageOn="main.settings.account.vacation.on"
        messageOff="main.settings.account.vacation.off"
        onPress={() =>
          updateMentorData({ is_vacationing: !mentor?.is_vacationing })
        }
        testID="main.settings.
          account.vacation.switch"
      />
      <Message
        style={styles.fieldName}
        id="main.settings.account.status.title"
        testID="main.settings.account.status.title"
      />
      <StatusMessageForm
        statusMessage={statusMessage}
        setStatusMessage={setStatusMessage}
        onButtonPress={() =>
          updateMentorData({ status_message: statusMessage })
        }
        maxLength={30}
      />
    </>
  );
};

const styles = RN.StyleSheet.create({
  fieldName: {
    ...fonts.regular,
    color: colors.blueGray,
    marginTop: 16,
  },
  changePasswordButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.blue,
  },
  buttonText: {
    ...fonts.regularBold,
    color: colors.white,
  },
  failBox: {
    tintColor: colors.danger,
  },
  vacationSwitch: { marginTop: 8 },
});
