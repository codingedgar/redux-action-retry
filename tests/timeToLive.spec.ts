import {
  Config,
  REDUX_ACTION_RETRY,
  cacheConfig,
  retryAllActionCreator,
  CachedAction,
  CacheableAction
} from "../src/core/index";
import {
  TimeToLive,
  timeToLiveConfg,
  timeToLiveWrapAction,
  liveUntilKey
} from "../src/timeToLive";

import { now } from "../src/now";

import { wholePipeline } from "./utils/tearUp";

import * as fc from 'fast-check';

import {
  splitEvery,
  values,
  uniq,
  map,
  pipe,
  sort,
} from 'ramda';

import uuid from 'uuid/v4'
import { duration } from "moment";
import moment from 'moment';


jest.mock('../src/now', () => ({
  now: jest.fn()
}))

test('actions are removed from cach after time to live', () => {
  const fixedNow = moment();
  const cooldownNowMock = now as jest.Mock;

  fc.assert(
    fc.property(
      actionAndCacheGen
      , ({ actions, cache }) => {

        cooldownNowMock.mockImplementation(() => fixedNow.clone())

        const conf: Partial<Config<timeToLiveConfg, timeToLiveWrapAction>> = {
          cache,
          extensions: [
            TimeToLive
          ]
        }

        const times = pipe(
          values,
          map<timeToLiveConfg, number>(typeConfig => typeConfig.timeToLive.asMilliseconds()),
          uniq,
          sort((a, b) => a - b)
        )(cache)


        const pipeline = wholePipeline({}, conf)

        const calledWith = []
        const retryAllAction = retryAllActionCreator()


        //insert All Actions To Cache
        for (const action of actions) {

          calledWith.push([action])
          pipeline.store.dispatch(action)

        }

        calledWith.push([retryAllAction], ...splitEvery(1, actions))
        pipeline.store.dispatch(retryAllAction)

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        for (const time of times) {

          cooldownNowMock.mockImplementation(() => fixedNow.clone().add(time))

          const actionsThanShouldBeKeep = pipeline.store.getState()[REDUX_ACTION_RETRY].cache
            .filter((wrappedAction) => {
              const ca = wrappedAction as any as CachedAction<timeToLiveWrapAction>
              return ca[liveUntilKey].isAfter(now())
            })
            .map(wrappedAction => wrappedAction.action)

          calledWith.push([retryAllAction], ...splitEvery(1, actionsThanShouldBeKeep))

          pipeline.store.dispatch(retryAllAction)

          expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

          expect(
            pipeline.store.getState()[REDUX_ACTION_RETRY].cache.map(cachedAction => cachedAction.action)
          )
            .toEqual(actionsThanShouldBeKeep)

          pipeline.store.getState()[REDUX_ACTION_RETRY].cache.forEach((cachedAction) => {
            const ca = ((cachedAction as any) as CachedAction<timeToLiveWrapAction>)
            expect(ca[liveUntilKey].isAfter(now())).toBe(true)
          })

        }

      })
  )

})

const actionAndCacheGen = fc
  .set(
    fc.tuple(
      fc.fullUnicodeString(1, 15),
      fc.integer(10, duration('PT3H').asMilliseconds())
    ),
    (a, b) => {
      return a[0] === b[0]
    })
  .chain(types => {

    const cache: cacheConfig<timeToLiveConfg> = types.reduce<cacheConfig<timeToLiveConfg>>(
      (acc, [type, time]) => ({
        ...acc,
        [type]: {
          type: type,
          timeToLive: duration(time)
        }
      }),
      {}
    );

    const actions: CacheableAction[] = types.map(([type, _]) => ({
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
      actions: fc.constant(actions)
    })
  })