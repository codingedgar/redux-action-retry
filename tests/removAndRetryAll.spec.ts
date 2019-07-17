import * as fc from 'fast-check';

import {
  Config,
  REDUX_ACTION_RETRY,
  cacheConfig,
  REMOVE,
  retryAllActionCreator
} from "../src/core/index";
import {
  removeAndRetryAllConfg,
  removeAndRetryAllWrapAction,
  removeAndRetryAllActionCreator
} from "../src/removeAndRetryAll";

import { wholePipeline } from "./utils/tearUp";


import {
  splitEvery,
} from 'ramda';

import uuid from 'uuid/v4'


test('actions are removed from cach after time to live', () => {

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

          calledWith.push([action])
          pipeline.store.dispatch(action)

        }

        calledWith.push([retryAllAction], ...splitEvery(1, actions))
        pipeline.store.dispatch(retryAllAction)

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        const actionsThanShouldBeFired = pipeline.store.getState()[REDUX_ACTION_RETRY].cache
          .filter(
            (wrappedAction) =>
              wrappedAction.action.meta[REDUX_ACTION_RETRY].id !== removeAndRetryAllAction[REMOVE].meta[REDUX_ACTION_RETRY].id)
          .map(wrappedAction => wrappedAction.action)

        calledWith.push(
          [removeAndRetryAllAction],
          ...splitEvery(1, actionsThanShouldBeFired)
        )

        pipeline.store.dispatch(removeAndRetryAllAction)
        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        expect(
          pipeline.store.getState()[REDUX_ACTION_RETRY].cache.map(cachedAction => cachedAction.action)
        )
          .toEqual(actionsThanShouldBeFired)

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