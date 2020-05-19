import {
  Cooldown,
  cooldownConfg,
  cooldownWrapAction,
  cancelCooldownActionCreator,
  coolAndRetryAllActionCreator
} from "../src/cooldown";
import * as cooldownNow from "../src/now";

import { wholePipeline } from "./utils/wholePipeline";

import * as fc from 'fast-check';

import {
  last,
  values,
  uniq,
  map,
  pipe,
  sort,
  clone,
} from 'ramda';

import uuid from 'uuid/v4'
import { duration } from "moment";
import moment from 'moment';
import { Actions2RetryAllDispatchPattern } from './utils/fns';
import { upsertActionCreator } from '../src/core/upsert';
import { retryAllActionCreator } from '../src/core/retryAll';
import { Config, REDUX_ACTION_RETRY, CachedAction, CacheableAction, cacheConfig } from "../src/core/types";


jest.mock('../src/now', () => ({
  now: jest.fn()
}))


test('when action is cooling retrying has no effect', () => {
  const now = moment();
  (cooldownNow.now as jest.Mock).mockImplementation(() => now.clone())

  fc.assert(
    fc.property(
      fc.tuple(
        fc.integer(
          duration('PT1S').asMilliseconds(),
          duration('PT24H').asMilliseconds()
        ),
        fc.set(
          fc.fullUnicodeString(1, 15),
          1
        ),
      )
      , (arr) => {

        const cooldownTime = duration(arr[0])

        const conf: Partial<Config<cooldownConfg, cooldownWrapAction>> = {
          cache: arr[1].reduce(
            (acc, x) => ({
              ...acc, [x[0]]: {
                type: x[0],
                cooldownTime
              }
            }),
            {}
          ),
          extensions: [
            Cooldown
          ]
        }

        const pipeline = wholePipeline({}, conf)

        const actions = []
        const calledWith = []
        const wrappedActions = []
        const retryAllAction = retryAllActionCreator()

        for (const iterator of arr[1]) {

          const action: CacheableAction = {
            type: iterator[0],
            payload: Symbol('payload'),
            meta: {
              [REDUX_ACTION_RETRY]: {
                id: uuid(),
              }
            }
          }

          const wrappedAction: CachedAction<cooldownWrapAction> = {
            action,
            coolDownUntil: now.clone().add(cooldownTime)
          }

          wrappedActions.push(wrappedAction)
          actions.push(action)
          calledWith.push(
            [upsertActionCreator(action)],
            [action],
            [retryAllAction],
          )

          pipeline.store.dispatch(action)
          expect(last(pipeline.store.getState()[REDUX_ACTION_RETRY].cache)).toEqual(wrappedAction)
          pipeline.store.dispatch(retryAllAction)

        }
        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)
        expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache).toEqual(wrappedActions)

      })
  )

})

test('0ms cooldown is the same as retry all without plugin', () => {
  const now = moment();
  (cooldownNow.now as jest.Mock).mockImplementation(() => now.clone())

  fc.assert(
    fc.property(
      fc.set(
        fc.fullUnicodeString(1, 15)
      ),
      (arr) => {

        const cooldownTime = duration(arr[0])

        const conf = {
          cache: arr.reduce(
            (acc, x) => ({
              ...acc, [x[0]]: {
                type: x[0],
                cooldownTime
              }
            }),
            {}
          ),
          extensions: [Cooldown]
        }

        const pipeline = wholePipeline({}, conf)

        const actions = []
        const wrappedActions = []
        const calledWith = []

        const retryAllAction = retryAllActionCreator()

        for (const iterator of arr) {

          const action: CacheableAction = {
            type: iterator[0],
            payload: Symbol('payload'),
            meta: {
              [REDUX_ACTION_RETRY]: {
                id: uuid(),
              }
            }
          }

          const wrappedAction: CachedAction<cooldownWrapAction> = {
            action,
            coolDownUntil: now.clone().add(cooldownTime)
          }

          wrappedActions.push(wrappedAction)
          actions.push(action)

          calledWith.push(
            [upsertActionCreator(action)],
            [action],
            [retryAllAction],
            ...Actions2RetryAllDispatchPattern(actions)
          )

          pipeline.store.dispatch(action)
          expect(last(pipeline.store.getState()[REDUX_ACTION_RETRY].cache)).toEqual(wrappedAction)

          const oldState = pipeline.store.getState();
          pipeline.store.dispatch(retryAllAction)

          expect(pipeline.store.getState()).toEqual(oldState)

        }

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)
        expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache).toEqual(wrappedActions)

      })
  )

})

test('cooled actions are retryable', () => {
  const now = moment();
  const cooldownNowMock = (cooldownNow.now as jest.Mock)

  fc.assert(
    fc.property(
      actionAndCacheGen,
      ({ actions, cache }) => {
        cooldownNowMock.mockImplementation(() => now.clone())

        const config: Partial<Config<cooldownConfg, cooldownWrapAction>> = {
          cache: cache,
          extensions: [Cooldown],
        }

        const times = pipe(
          (x: cacheConfig<cooldownConfg>) => values(x),
          map<cooldownConfg, number>(typeConfig => typeConfig.cooldownTime.asMilliseconds()),
          uniq,
          sort((a, b) => a - b)
        )(cache)

        const pipeline = wholePipeline<cooldownConfg, cooldownWrapAction>({}, config)

        const retryAllAction = retryAllActionCreator()
        const calledWith = []

        for (const action of actions) {
          calledWith.push(
            [upsertActionCreator(action)],
            [action],
          )
          pipeline.store.dispatch(action)
        }


        for (const time of times) {

          cooldownNowMock.mockImplementation(() => now.clone().add(time))

          const actionsThanShouldBeFired = pipeline.store.getState()[REDUX_ACTION_RETRY].cache
            .filter((wrappedAction) => {
              const ca = ((wrappedAction as any) as CachedAction<cooldownWrapAction>)
              return ca.coolDownUntil.isSameOrBefore(cooldownNow.now())
            })
            .map(wrappedAction => wrappedAction.action)

          calledWith.push([retryAllAction], ...Actions2RetryAllDispatchPattern(actionsThanShouldBeFired))

          expect(actionsThanShouldBeFired.length).toBeGreaterThanOrEqual(1)

          pipeline.store.dispatch(retryAllAction)

          pipeline.store.getState()[REDUX_ACTION_RETRY].cache.forEach((cachedAction) => {
            const ca = ((cachedAction as any) as CachedAction<cooldownWrapAction>)
            expect(ca.coolDownUntil.isAfter(cooldownNow.now())).toBe(true)
          })
        }

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

      })
  )

})

test('cooled makes retrying work again', () => {
  const now = moment();
  (cooldownNow.now as jest.Mock).mockImplementation(() => now.clone())

  fc.assert(
    fc.property(
      actionAndCacheGen
      , ({ actions, cache }) => {

        const conf: Partial<Config<cooldownConfg, cooldownWrapAction>> = {
          cache,
          extensions: [
            Cooldown
          ]
        }

        const pipeline = wholePipeline({}, conf)

        const calledWith = []
        const retryAllAction = retryAllActionCreator()


        //insert All Actions To Cache
        for (const action of actions) {

          calledWith.push([upsertActionCreator(action)], [action])
          pipeline.store.dispatch(action)

        }

        calledWith.push([retryAllAction])
        pipeline.store.dispatch(retryAllAction)

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        for (const action of actions) {

          const cancelCooldown = cancelCooldownActionCreator(action)

          calledWith.push([cancelCooldown], [retryAllAction], [upsertActionCreator(action)], [action])

          pipeline.store.dispatch(cancelCooldown)
          pipeline.store.dispatch(retryAllAction)
          expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        }

      })
  )

})

test(`cool and retry all makes retrying work again`, () => {
  const cooldownNowMock = (cooldownNow.now as jest.Mock)
  const now = moment();
  const nowPlus5ms = now.clone().add(duration(5));

  fc.assert(
    fc.property(
      actionAndCacheGen
      , ({ actions, cache }) => {
        cooldownNowMock.mockImplementation(() => now.clone())

        const conf: Partial<Config<cooldownConfg, cooldownWrapAction>> = {
          cache,
          extensions: [
            Cooldown
          ]
        }

        const pipeline = wholePipeline({}, conf)

        const calledWith = []
        const retryAllAction = retryAllActionCreator()


        //insert All Actions To Cache
        for (const action of actions) {

          calledWith.push([upsertActionCreator(action)], [action])
          pipeline.store.dispatch(action)

        }

        cooldownNowMock.mockImplementation(() => nowPlus5ms.clone())

        calledWith.push([retryAllAction])
        pipeline.store.dispatch(retryAllAction)
        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)

        const coolAndRetryAll = coolAndRetryAllActionCreator()

        const beforeState = clone(pipeline.store.getState())

        calledWith.push([coolAndRetryAll], ...Actions2RetryAllDispatchPattern(actions))
        pipeline.store.dispatch(coolAndRetryAll)

        expect(pipeline.gotToReducerSpy.mock.calls).toEqual(calledWith)
        const afterState = clone(pipeline.store.getState())

        if (beforeState[REDUX_ACTION_RETRY].cache.length) {
          expect(beforeState).not.toEqual(afterState)
        }

        afterState[REDUX_ACTION_RETRY].cache
          .forEach((wrappedAction) => {
            const ca = ((wrappedAction as any) as CachedAction<cooldownWrapAction>)
            expect(
              ca.coolDownUntil
                .isSame(
                  nowPlus5ms.clone().add(conf.cache![ca.action.type].cooldownTime)
                )
            )
              .toBe(true)
          })
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

    const cache: cacheConfig<cooldownConfg> = types.reduce(
      (acc, [type, time]) => ({
        ...acc,
        [type]: {
          type: type,
          cooldownTime: duration(time)
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
