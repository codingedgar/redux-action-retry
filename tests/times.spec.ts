import * as fc from 'fast-check';

import {
  Config,
  REDUX_ACTION_RETRY,
  cacheConfig,
  retryAllActionCreator,
  CachedAction
} from "../src/core/index";
import {
  times,
  timesConfg,
  timesWrapAction
} from "../src/times";

import { wholePipeline } from "./utils/tearUp";


import {
  splitEvery,
} from 'ramda';

import uuid from 'uuid/v4'


test('actions are removed from cach after time to live', () => {

  fc.assert(
    fc.property(
      actionAndCacheGen
      , ({ actions, cache }) => {

        const conf: Partial<Config<timesConfg, timesWrapAction>> = {
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
          calledWith.push([action], [retryAllAction], ...splitEvery(1, actionsDispached))

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

    const cache: cacheConfig<timesConfg> = types.reduce<cacheConfig<timesConfg>>(
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