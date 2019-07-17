import {
  Config,
  createRetryMechanishm,
} from "../../src/core/index";

import {
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';

export function wholePipeline<T,U>(preloadState: any, config: Partial<Config<T,U>>) {

  const gotToReducerSpy = jest.fn();
  const { reducer, reduxActionRetryMiddleware, stateKeyName } = createRetryMechanishm<T,U>(config)
  const store = createStore(
    combineReducers({
      [stateKeyName]: reducer
    }),
    preloadState,
    applyMiddleware
      (
        reduxActionRetryMiddleware,
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
