import React from 'react';
import RN from 'react-native';
import * as redux from 'redux';
import { useDispatch, useSelector } from 'react-redux';
import * as changeEmailState from '../../../state/reducers/changeEmail';
import * as actions from '../../../state/actions';
import * as selector from '../../../state/selectors';

import { SafeAreaView } from 'react-native-safe-area-context';
import { StackScreenProps } from '@react-navigation/stack';
import { StackRoutes } from 'src/Screens';

import { pipe } from 'fp-ts/lib/pipeable';
import * as RD from '@devexperts/remote-data-ts';

import Message from '../../components/Message';
import ScreenTitle from '../../components/ScreenTitle';
import colors from '../../components/colors';
import fonts from '../../components/fonts';
import CreatedBySosBanner from '../../components/CreatedBySosBanner';
import Spinner from '../../components/Spinner';

import { Toast } from '../../components/Toast';
import EmailForm from '../../components/EmailForm';
import AlertModal from '../../components/Modal';

export type EmailChangeRoute = {
  'Main/Settings/EmailChange': {};
};

type Props = StackScreenProps<StackRoutes, 'Main/Settings/EmailChange'>;

export default ({ navigation }: Props) => {
  const account = useSelector(selector.getAccount);

  const [email, setEmail] = React.useState(account?.email ?? '');
  const dispatch = useDispatch<redux.Dispatch<actions.Action>>();

  const onGoBack = () => {
    navigation.goBack();
  };

  const changeEmail = () => {
    dispatch(changeEmailState.changeEmail({ email, account }));
  };

  const resetChangeEmail = () => {
    dispatch(changeEmailState.resetChangeEmail);
  };
  const requestState = useSelector(changeEmailState.select);

  const resetAndGoBack = () => {
    dispatch(changeEmailState.resetChangeEmail);
    onGoBack();
  };

  React.useEffect(() => {
    if (RD.isSuccess(requestState)) {
      const timeout = setTimeout(
        resetAndGoBack,
        changeEmailState.coolDownDuration,
      );

      return () => clearTimeout(timeout);
    }
  }, [requestState]);

  return (
    <RN.View style={styles.screen}>
      <ScreenTitle id="main.settings.account.email.title" onBack={onGoBack} />
      <RN.ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        testID={'main.settings.email.view'}
      >
        <SafeAreaView style={styles.buttonContainer}>
          <Message
            style={styles.title}
            id="main.settings.account.email.title"
          />
          <Message
            style={styles.fieldName}
            id="main.settings.account.userName"
          />
          <RN.Text style={styles.fieldValueText}>{account?.userName}</RN.Text>
          {pipe(
            requestState,
            RD.fold(
              () => (
                <EmailForm
                  email={email}
                  setEmail={setEmail}
                  onGoBack={onGoBack}
                  onButtonPress={changeEmail}
                />
              ),
              () => (
                <RN.View style={styles.spinnerContainer}>
                  <Spinner style={styles.spinner} />
                </RN.View>
              ),
              () => (
                <AlertModal
                  modalType="danger"
                  messageId="main.settings.account.email.fail"
                  onPrimaryPress={changeEmail}
                  onSecondaryPress={resetChangeEmail}
                />
              ),
              () => (
                <Toast
                  toastType="success"
                  duration={changeEmailState.coolDownDuration}
                  messageId="main.settings.account.email.success"
                />
              ),
            ),
          )}
          <CreatedBySosBanner />
        </SafeAreaView>
      </RN.ScrollView>
    </RN.View>
  );
};

const styles = RN.StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  title: {
    ...fonts.titleBold,
    color: colors.darkestBlue,
    marginBottom: 24,
  },
  fieldName: {
    ...fonts.regular,
    color: colors.blueGray,
    marginTop: 16,
  },
  fieldValueText: {
    ...fonts.largeBold,
    color: colors.darkestBlue,
  },
  scrollView: {
    zIndex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 24,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  spinnerContainer: { flexGrow: 1 },
  spinner: {
    alignSelf: 'center',
  },
  failBox: {
    tintColor: colors.danger,
  },
  successBox: {
    tintColor: colors.darkBlue,
  },
  buttonContainer: {
    flex: 1,
    alignSelf: 'stretch',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    marginVertical: 24,
  },
});
