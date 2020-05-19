import {
  identity,
  converge,
  map,
  zipWith,
  unnest,
  pipe
} from 'ramda';

import { upsertActionCreator } from '../../src/core/upsert';
import * as fc from 'fast-check';
import {
  REDUX_ACTION_RETRY, 
} from '../../src';

export function actionAndCacheGen() {
  return fc
    .array(
      fc.record({
        type: fc.fullUnicodeString(1, 15),
        payload: fc.anything(),
        meta: fc.record({
          [REDUX_ACTION_RETRY]: fc.record({
            id: fc.uuid(),
          })
        })
      })
    )
    .map(
      actions => ({
        actions: actions,
        libConfig: {
          cache: actions.reduce(
            (config, action) => ({
              ...config,
              [action.type]: {}
            }),
            {}
          )
        }
      })
    )
}

export const Actions2RetryAllDispatchPattern = converge(
  pipe(zipWith((l, r) => [[l], [r]]), unnest),
  [
    map(upsertActionCreator),
    identity,
  ])
