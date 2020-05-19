import * as fc from 'fast-check';

import {
  Config,
  REDUX_ACTION_RETRY,
  cacheConfig,
  CachedAction,
} from "../src/core/types";
import {
  times,
  timesConfig,
  timesWrapAction
} from "../src/times";

import { wholePipeline } from "./utils/wholePipeline";

import uuid from 'uuid/v4'
import { Actions2RetryAllDispatchPattern } from './utils/fns';
import { upsertActionCreator } from '../src/core/upsert';
import { retryAllActionCreator } from '../src/core/retryAll';


test('actions are removed from cach after time to live', () => {

  fc.assert(
    fc.property(
      actionAndCacheGen
      , ({ actions, cache }) => {

        const conf: Partial<Config<timesConfig, timesWrapAction>> = {
          cache,
          extensions: [
            times
          ]
        }

        const pipeline = wholePipeline({}, conf)
        const calledWith = []
        const retryAllAction = retryAllActionCreator()

        const actionsDispached = []

        //insert All Actions To Cache
        for (const action of actions) {

          actionsDispached.push(action)

          calledWith.push(
            [upsertActionCreator(action)],
            [action],
            [retryAllAction],
            ...Actions2RetryAllDispatchPattern(actionsDispached)
          )

          pipeline.store.dispatch(action)
          pipeline.store.dispatch(retryAllAction)

          expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

          pipeline.store.getState()[REDUX_ACTION_RETRY].cache
            .forEach((cachedAction, index, arr) => {
              const ca = cachedAction as any as CachedAction<timesWrapAction>
              expect(ca.times).toEqual(arr.length - index)
            })
        }

      })
  )

})

const actionAndCacheGen = fc
  .set(
    fc.fullUnicodeString(1, 15),
    1,
    10,
  )
  .chain(types => {

    const cache: cacheConfig<timesConfig> = types.reduce<cacheConfig<timesConfig>>(
      (acc, type) => ({
        ...acc,
        [type]: {
          type: type
        }
      }),
      {}
    );

    const actions = types.map((type) => ({
      type,
      payload: Symbol('payload'),
      meta: {
        [REDUX_ACTION_RETRY]: {
          id: uuid(),
        }
      }
    }))

    return fc.record({
      cache: fc.constant(cache),
      actions: fc.constant(actions),
    })
  })
