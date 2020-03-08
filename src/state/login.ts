import * as automaton from 'redux-automaton';
import * as E from 'fp-ts/lib/Either';
import * as R from 'fp-ts-rxjs/lib/Observable';
import * as RD from '@devexperts/remote-data-ts';
import { pipe } from 'fp-ts/lib/pipeable';

import * as authApi from '../api/auth';
import * as err from '../lib/http-err';

import { cmd } from './actions/epic';
import * as actions from './actions';
import * as model from './model';

export type State = model.AppState['login'];

export const initialState = RD.initial;

export const reducer: automaton.Reducer<State, actions.Action> = (
  state = initialState,
  action,
) => {
  switch (action.type) {
    case 'login/start':
      return automaton.loop(
        RD.pending,
        cmd(() =>
          R.observable.map(
            authApi.login(action.payload),
            actions.make('login/end'),
          ),
        ),
      );
    case 'login/end':
      return pipe(
        action.payload,
        E.fold<
          err.Err,
          authApi.AccessToken,
          automaton.Loop<State, actions.Action> | State
        >(
          e => RD.failure(e),
          token =>
            automaton.loop(
              RD.success(token),
              pipe(
                token,
                actions.make('token/Acquired'),
              ),
            ),
        ),
      );
    default:
      return state;
  }
};
