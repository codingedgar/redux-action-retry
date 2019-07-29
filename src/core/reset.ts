import { Config, State, INITIAL_STATE, REDUX_ACTION_RETRY, RarAction } from './types';
import { AnyAction } from 'redux';

export const RESET = 'RESET'

export function reset(_: Config) {
  return {
    reducer: () => (state: State = INITIAL_STATE, action: AnyAction): State => {
      return (action.type === REDUX_ACTION_RETRY && action[RESET])
        ? INITIAL_STATE
        : state
    }
  }
}

type resetCommand = RarAction & {
  [RESET]: true
}

export function resetActionCreator(): resetCommand {
  return {
    type: REDUX_ACTION_RETRY,
    [RESET]: true
  }
}