import * as fc from 'fast-check';

import {
  REDUX_ACTION_RETRY,
  cacheConfig,
  CacheableAction
} from "../src/core/index";
import {
  removeAndRetryAllConfg,
  removeAndRetryAllActionCreator
} from "../src/removeAndRetryAll";

import { wholePipeline } from "./utils/tearUp";

import {
  find,
} from 'ramda';

import uuid from 'uuid/v4'
import { Actions2RetryAllDispatchPattern } from './utils/fns';
import { upsertActionCreator } from '../src/core/upsert';
import { retryAllActionCreator } from '../src/core/retryAll';
import { REMOVED } from '../src/core/protocols/REMOVED_PROTOCOL';

test.only('actions are removed from cach after time to live', () => {

  fc.assert(
    fc.property(
      actionAndCacheGen
      , ({ actions, cache, actionToRemove }) => {

        const conf = {
          cache,
          extensions: []
        }

        const pipeline = wholePipeline({}, conf)
        const calledWith = []
        const retryAllAction = retryAllActionCreator()

        const removeAndRetryAllAction = removeAndRetryAllActionCreator(actions[actionToRemove])

        //insert All Actions To Cache
        for (const action of actions) {

          calledWith.push([upsertActionCreator(action)], [action])
          pipeline.store.dispatch(action)

        }

        calledWith.push(
          [retryAllAction],
          ...Actions2RetryAllDispatchPattern(actions)
        )
        pipeline.store.dispatch(retryAllAction)

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        const actionsThanShouldBeFired = pipeline.store.getState()[REDUX_ACTION_RETRY].cache
          .filter(
            (wrappedAction) =>
              !!find<CacheableAction>(
                removed => wrappedAction.action.meta[REDUX_ACTION_RETRY].id !== removed.meta[REDUX_ACTION_RETRY].id
              )(removeAndRetryAllAction[REMOVED])
          )
          .map(wrappedAction => wrappedAction.action)

        calledWith.push(
          [removeAndRetryAllAction],
          ...Actions2RetryAllDispatchPattern(actionsThanShouldBeFired)
        )

        pipeline.store.dispatch(removeAndRetryAllAction)

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        expect(
          pipeline.store.getState()[REDUX_ACTION_RETRY].cache.map(cachedAction => cachedAction.action)
        )
          .toEqual(actionsThanShouldBeFired)

      }),
    {
      seed: 1534992873, path: "0:1:0:0:1:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0",
    }
  )

})

const actionAndCacheGen = fc
  .set(
    fc.fullUnicodeString(1, 15),
    1,
    10,
  )
  .chain(types => {

    const cache: cacheConfig<removeAndRetryAllConfg> = types.reduce<cacheConfig<removeAndRetryAllConfg>>(
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
      actionToRemove: fc.nat(actions.length - 1),
    })
  })