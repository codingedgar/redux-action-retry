import {
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';
import {
  createRetryMechanism,
  Config,
} from "../../src";

export function wholePipeline<T, U>(
  preloadState: any,
  config: Partial<Config<T, U>>
) {

  const gotToReducerSpy = jest.fn();

  const {
    reducer,
    reduxActionRetryMiddlewares,
    stateKeyName
  } = createRetryMechanism<T, U>(config)

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
