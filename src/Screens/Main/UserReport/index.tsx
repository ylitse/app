import React from 'react';
import RN from 'react-native';

import * as ReactRedux from 'react-redux';

import { StackScreenProps } from '@react-navigation/stack';
import { StackRoutes } from '../..';

import useLayout from 'src/lib/use-layout';

import { SafeAreaView } from 'react-native-safe-area-context';
import { Title } from './Title';
import TitledContainer from 'src/Screens/components/TitledContainer';
import colors from 'src/Screens/components/colors';
import Button from 'src/Screens/components/Button';

export type UserReportRoute = {
  'Main/UserReport': { reportedId: string };
};

type Props = StackScreenProps<StackRoutes, 'Main/UserReport'>;

const UserReport = ({ navigation, route }: Props) => {
  const reportedId = route.params?.reportedId;
  const [_, onLayout] = useLayout();
  const dispatch = ReactRedux.useDispatch();

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleReport = () => {
    dispatch({
      type: 'userReport/start',
      payload: {
        reportedId,
        contactEmail: 'asd@moi.fi',
        contactPhone: '0447766444',
        description: 'Hello World',
        reportedMessageId: 'jsL8mJ_9hAbbs68jJsh4D4NDzPKD_K-fEnUX07PTLpY',
      },
    });
  };

  return (
    <TitledContainer
      onLayout={onLayout}
      TitleComponent={<Title onBack={handleBackPress} />}
      color={colors.blue}
    >
      <SafeAreaView style={styles.container}>
        <RN.Text>Report user with id: {reportedId} </RN.Text>
        <Button
          onPress={handleReport}
          messageId="main.userreport.send.button"
        />
      </SafeAreaView>
    </TitledContainer>
  );
};

const styles = RN.StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default UserReport;
