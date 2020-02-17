import React from 'react';
import RN from 'react-native';
import * as redux from 'redux';
import * as ReactRedux from 'react-redux';

import * as navigationProps from '../../../lib/navigation-props';
import * as http from '../../../lib/http';
import * as remoteData from '../../../lib/remote-data';

import * as buddyApi from '../../../api/buddies';

import * as state from '../../../state';
import * as selectors from '../../../state/selectors';
import * as actions from '../../../state/actions';

import colors, { gradients } from '../../components/colors';
import fonts from '../../components/fonts';
import { textShadow } from '../../components/shadow';
import Message from '../../components/Message';
import RemoteData from '../../components/RemoteData';
import TitledContainer from '../../components/TitledContainer';

import Button from './Button';

import { ChatRoute } from '../Chat';

export type BuddyListRoute = {
  'Main/BuddyList': {};
};

type StateProps = {
  buddies: remoteData.RemoteData<buddyApi.Buddy[], http.Err>;
};
type DispatchProps = {
  pollBuddies: () => void | undefined;
};

type OwnProps = navigationProps.NavigationProps<BuddyListRoute, ChatRoute>;
type Props = StateProps & DispatchProps & OwnProps;

const BuddyList = ({ navigation, buddies, pollBuddies }: Props) => {
  const onPress = () => {
    navigation.navigate('Main/Chat', {});
  };
  return (
    <TitledContainer
      TitleComponent={
        <Message id="buddyList.title" style={styles.screenTitleText} />
      }
      gradient={gradients.pillBlue}
    >
      <RemoteData data={buddies} fetchData={pollBuddies}>
        {value => (
          <RN.ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
          >
            {value.map(buddy => (
              <Button
                key={buddy.userId}
                style={styles.button}
                onPress={onPress}
                buddy={buddy}
              />
            ))}
          </RN.ScrollView>
        )}
      </RemoteData>
    </TitledContainer>
  );
};

const styles = RN.StyleSheet.create({
  screenTitleText: {
    marginTop: 16,
    marginBottom: 16,
    ...fonts.specialTitle,
    ...textShadow,
    textAlign: 'center',
    color: colors.white,
  },
  scrollView: {
    zIndex: 1,
    marginTop: -32,
  },
  scrollContent: {
    paddingTop: 48,
    paddingHorizontal: 16,
  },
  button: { marginVertical: 16 },
});

export default ReactRedux.connect<
  StateProps,
  DispatchProps,
  OwnProps,
  state.AppState
>(
  appState => {
    return {
      buddies: selectors.getBuddies(appState),
    };
  },
  (dispatch: redux.Dispatch<actions.Action>) => ({
    pollBuddies: () => {
      dispatch(
        actions.creators.startPolling(actions.creators.fetchBuddies(), 3000),
      );
    },
  }),
)(BuddyList);
