import * as fc from 'fast-check';
import { last } from 'ramda';
import { wholePipeline } from "./utils/wholePipeline";
import { Actions2RetryAllPattern } from './utils/Actions2RetryAllPattern';
import {
  resetActionCreator,
  retryAllActionCreator,
  removeActionCreator,
  REDUX_ACTION_RETRY,
} from '../src/';

test('Non cacheable actions are not cached', () => {

  fc.assert(
    fc.property(
      fc.array(
        fc.tuple(
          fc.fullUnicodeString(),
          fc.fullUnicodeString()
        )
      ),
      (arr) => {

        const pipeline = wholePipeline({}, {
          cache: {},
        })

        for (const iterator of arr) {

          const action = {
            type: iterator[0],
            payload: iterator[1],
          }

          pipeline.store.dispatch(action)

          expect(pipeline.store.getState())
            .toEqual({ [REDUX_ACTION_RETRY]: { cache: [] } })
        }

      }
    )
  )
})

test('Cacheable actions are cached', () => {

  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          type: fc.fullUnicodeString(1, 15),
          payload: fc.fullUnicodeString(),
          id: fc.uuid()
        }),
        1,
        15),
      (actions) => {

        const config = {
          cache: actions.reduce(
            (config, action) => ({
              ...config,
              [action.type]: {}
            }),
            {}
          )
        }

        const pipeline = wholePipeline({}, config)
        const expectedCachedActions = []

        for (const inputAction of actions) {

          const action = {
            type: inputAction.type,
            payload: inputAction.payload,
            meta: {
              [REDUX_ACTION_RETRY]: {
                id: inputAction.id
              }
            }
          }

          const cacheWrap = {
            action
          }

          expectedCachedActions.push(cacheWrap)

          pipeline.store.dispatch(action)

          expect(last(pipeline.store.getState()[REDUX_ACTION_RETRY].cache))
            .toEqual(cacheWrap)
        }

        expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache)
          .toEqual(expectedCachedActions)

      }
    )
  )
})

test('Reset returns empty cache', () => {

  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          type: fc.fullUnicodeString(1, 15),
          payload: fc.fullUnicodeString(),
          meta: fc.record({
            [REDUX_ACTION_RETRY]: fc.record({
              id: fc.uuid()
            })
          })
        }),
        1,
        15
      ),
      (actions) => {

        const libConfig = {
          cache: actions.reduce(
            (config, action) => ({
              ...config,
              [action.type]: {}
            }),
            {}
          )
        }

        const pipeline = wholePipeline({}, libConfig)
        const resetAction = resetActionCreator()

        for (const action of actions) {

          pipeline.store.dispatch(action)
          pipeline.store.dispatch(resetAction)
          expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache).toEqual([])

        }
      }
    )
  )
})

test('Remove returns cache without element', () => {

  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          type: fc.fullUnicodeString(1, 15),
          payload: fc.anything(),
          meta: fc.record({
            [REDUX_ACTION_RETRY]: fc.record({
              id: fc.uuid()
            })
          })
        }),
        1,
        15
      ),
      (actions) => {

        const libConfig = {
          cache: actions.reduce(
            (config, action) => ({
              ...config,
              [action.type]: {}
            }),
            {}
          )
        }

        const pipeline = wholePipeline({}, libConfig)

        for (const action of actions) {

          const wrappedAction = {
            action
          }

          const removeAction = removeActionCreator(action)

          const oldState = pipeline.store.getState();

          pipeline.store.dispatch(action)
          expect(last(pipeline.store.getState()[REDUX_ACTION_RETRY].cache))
            .toEqual(wrappedAction)

          pipeline.store.dispatch(removeAction)

          expect(pipeline.store.getState()).toEqual(oldState)

        }

        expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache)
          .toEqual([])

      }
    )
  )
})

test('Retry all', () => {

  fc.assert(
    fc.property(
      fc.array(
        fc.record({
          type: fc.fullUnicodeString(1, 15),
          payload: fc.anything(),
          meta: fc.record({
            [REDUX_ACTION_RETRY]: fc.record({
              id: fc.uuid(),
            })
          })
        })
      ),
      actions => {

        const libConfig = {
          cache: actions.reduce(
            (config, action) => ({
              ...config,
              [action.type]: {}
            }),
            {}
          )
        }

        const pipeline = wholePipeline({}, libConfig)

        for (const action of actions) {

          pipeline.store.dispatch(action)

          expect(last(pipeline.store.getState()[REDUX_ACTION_RETRY].cache))
            .toEqual({ action: action })

          const oldState = pipeline.store.getState();

          pipeline.store.dispatch(retryAllActionCreator())

          expect(pipeline.store.getState())
            .toEqual(oldState)

        }

        expect(pipeline.gotToReducerSpy.mock.calls)
          .toEqual(Actions2RetryAllPattern(actions))

        expect(pipeline.store.getState()[REDUX_ACTION_RETRY].cache)
          .toEqual(actions.map(action => ({ action: action })))

      }
    )
  )
})
