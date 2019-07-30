import {
  createRetryMechanism,
} from "../../src/core/createRetryMechanism";
import {
  Config,
} from "../../src/core/types";


import {
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';

export function wholePipeline<T,U>(preloadState: any, config: Partial<Config<T,U>>) {

  const gotToReducerSpy = jest.fn();
  const { reducer, reduxActionRetryMiddlewares, stateKeyName } = createRetryMechanism<T,U>(config)
  const store = createStore(
    combineReducers({
      [stateKeyName]: reducer
    }),
    preloadState,
    applyMiddleware
      (
        ...reduxActionRetryMiddlewares,
        _store => next => action => {
          gotToReducerSpy(action)
          return next(action)
        }
      )
  );

  return {
    store,
    dispatchSpy: jest.spyOn(store, 'dispatch'),
    gotToReducerSpy,
  }
}
