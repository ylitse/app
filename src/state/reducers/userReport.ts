import * as automaton from 'redux-automaton';
import * as RD from '@devexperts/remote-data-ts';

import * as actions from '../actions';
import { AppState } from '../types';
import { withToken } from './accessToken';
import * as userReportApi from '../../api/userReport';

export const initialState = RD.initial;
export const coolDownDuration = 3000;

export const reducer: automaton.Reducer<
  RD.RemoteData<string, true>,
  actions.Action
> = (state = initialState, action: actions.Action) => {
  switch (action.type) {
    case 'userReport/start': {
      if (!RD.isInitial(state)) {
        return state;
      }

      return automaton.loop(
        RD.pending,
        withToken(
          userReportApi.reportUser(action.payload),
          actions.make('userReport/end'),
        ),
      );
    }

    case 'userReport/end': {
      return RD.fromEither(action.payload);
    }
    case 'userReport/reset':
      if (RD.isPending(state)) {
        return state;
      }

      return RD.initial;

    default: {
      return state;
    }
  }
};

export const selectUserReportRequest = ({ userReport: state }: AppState) =>
  state;

export const selectUserReportStatus = (state: AppState) => {
  return {
    isLoading: RD.isPending(state.userReport),
    isSuccess: RD.isSuccess(state.userReport),
    isError: RD.isFailure(state.userReport),
  };
};
