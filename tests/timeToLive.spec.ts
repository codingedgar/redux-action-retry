import {
  Config,
  REDUX_ACTION_RETRY,
  cacheConfig,
  CachedAction,
  CacheableAction,
  collectGarbageActionCreator,
  removeActionsCreator,
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
  partition,
  reduce
} from 'ramda';

import uuid from 'uuid/v4'
import { duration } from "moment";
import moment from 'moment';
import { Actions2RetryAllDispatchPattern } from './utils/fns';
import { upsertActionCreator } from '../src/core/upsert';
import { retryAllActionCreator } from '../src/core/retryAll';
// import reduce from 'ramda/es/reduce';


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

        const times = pipe<any, any, any[], any[], number[]>(
          values,
          map<timeToLiveConfg, number>(typeConfig => typeConfig.timeToLive.asMilliseconds()),
          uniq,
          sort((a, b) => a - b)
        )(cache)


        const pipeline = wholePipeline({}, conf)

        const calledWith = []
        const retryAllAction = retryAllActionCreator()
        const collectGarbageAction = collectGarbageActionCreator()


        //insert All Actions To Cache
        for (const action of actions) {

          calledWith.push([upsertActionCreator(action)], [action])
          pipeline.store.dispatch(action)

        }

        calledWith.push([retryAllAction], ...Actions2RetryAllDispatchPattern(actions))
        pipeline.store.dispatch(retryAllAction)

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        for (const time of times) {

          cooldownNowMock.mockImplementation(() => fixedNow.clone().add(time))

          const [actionsThanShouldBeKeep, actionsThanShouldBeRemoved] = reduce(
            (acc: [CacheableAction[], CacheableAction[]], cachedAction) => {
              const ca = cachedAction as any as CachedAction<timeToLiveWrapAction>
              if (ca[liveUntilKey].isAfter(now())) {
                acc[0].push(ca.action)
              } else {
                acc[1].push(ca.action)
              }
              return acc
            },
            [[], []]
          )
            (pipeline.store.getState()[REDUX_ACTION_RETRY].cache)

          calledWith.push(
            [collectGarbageAction],
            [removeActionsCreator(actionsThanShouldBeRemoved)]
          )

          pipeline.store.dispatch(collectGarbageAction)

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
      }),
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