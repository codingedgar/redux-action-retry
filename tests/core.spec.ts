import * as fc from 'fast-check';
import {
  REDUX_ACTION_RETRY,
  resetActionCreator,
  removeActionCreator,
  retryAllActionCreator,
  CacheableAction,
} from "../src/core/index";

import { wholePipeline } from "./utils/tearUp";

import {
  last,
  splitEvery,
} from 'ramda';
import uuid from 'uuid/v4'

test('non cacheable actions are not cached', () => {

  fc.assert(
    fc.property(fc.array(fc.tuple(fc.fullUnicodeString(), fc.fullUnicodeString())), (arr) => {

      const pipeline = wholePipeline({}, {
        cache: {},
      })

      for (const iterator of arr) {

        const action = {
          type: iterator[0],
          payload: iterator[1],
        }

        pipeline.store.dispatch(action)
        expect(pipeline.store.getState()).toEqual({ [REDUX_ACTION_RETRY]: { cache: [] } })
      }

    })
  )

})

test('Cacheable actions are cached', () => {

  fc.assert(
    fc.property(fc.array(fc.tuple(fc.fullUnicodeString(1, 15), fc.fullUnicodeString()), 1, 15), (arr) => {

      const conf = {
        cache: arr.reduce(
          (acc, x) => ({
            ...acc,
            [x[0]]: {}
          }),
          {}
        )
      }

      const pipeline = wholePipeline({}, conf)
      const actions = []

      for (const iterator of arr) {

        const action = {
          type: iterator[0],
          payload: iterator[1],
          meta: {
            [REDUX_ACTION_RETRY]: {
              id: uuid()
            }
          }
        }

        const cacheWrap = {
          action
        }

        actions.push(cacheWrap)

        pipeline.store.dispatch(action)

        expect(last(pipeline.store.getState()[REDUX_ACTION_RETRY].cache)).toEqual(cacheWrap)
      }

      expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache).toEqual(actions)

    })
  )

})

test('reset returns empty cache', () => {

  fc.assert(
    fc.property(fc.array(fc.tuple(fc.fullUnicodeString(1, 15), fc.fullUnicodeString()), 1), (arr) => {

      const conf = {
        cache: arr.reduce(
          (acc, x) => ({ ...acc, [x[0]]: {} }),
          {}
        )
      }

      const pipeline = wholePipeline({}, conf)
      const resetAction = resetActionCreator()

      for (const iterator of arr) {

        const action = {
          type: iterator[0],
          payload: iterator[1],
          meta: {
            [REDUX_ACTION_RETRY]: {
              id: uuid()
            }
          }
        }

        pipeline.store.dispatch(action)
        pipeline.store.dispatch(resetAction)
        expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache).toEqual([])
      }

    })
  )

})

test('remove returns cache without element', () => {

  fc.assert(
    fc.property(fc.array(fc.tuple(fc.fullUnicodeString(1, 15), fc.fullUnicodeString()), 1), (arr) => {

      const conf = {
        cache: arr.reduce(
          (acc, x) => ({ ...acc, [x[0]]: {} }),
          {}
        )
      }

      const pipeline = wholePipeline({}, conf)


      for (const iterator of arr) {

        const action: CacheableAction = {
          type: iterator[0],
          payload: iterator[1],
          meta: {
            [REDUX_ACTION_RETRY]: {
              id: uuid(),
            }
          }
        }

        const wrappedAction = {
          action
        }

        const removeAction = removeActionCreator(action)

        const oldState = pipeline.store.getState();

        pipeline.store.dispatch(action)
        expect(last(pipeline.store.getState()[REDUX_ACTION_RETRY].cache)).toEqual(wrappedAction)

        pipeline.store.dispatch(removeAction)

        expect(pipeline.store.getState()).toEqual(oldState)

      }

      expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache).toEqual([])

    })
  )

})

test('retry all', () => {

  fc.assert(
    fc.property(fc.set(fc.fullUnicodeString(1, 15)), (arr) => {

      const conf = {
        cache: arr.reduce(
          (acc, x) => ({ ...acc, [x[0]]: {} }),
          {}
        )
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

        const wrappedAction = {
          action
        }

        wrappedActions.push(wrappedAction)
        actions.push(action)
        calledWith.push([action], [retryAllAction], ...splitEvery(1, actions))

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