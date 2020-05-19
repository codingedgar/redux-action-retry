import {
  take,
  chain,
} from 'ramda';
import { pipe } from "fp-ts/lib/pipeable";
import {
  upsertActionCreator,
  CacheableAction,
  retryAllActionCreator,
} from '../../src';

export function Actions2RetryAllPattern(actions: CacheableAction[]) {

  return actions.reduce(
    (pattern: any[], action, index, actions) => {
      return [
        ...pattern,
        [upsertActionCreator(action)],
        [action],
        [retryAllActionCreator()],
        ...pipe(
          take(index + 1)(actions),
          chain((cachedAction) => [
            [upsertActionCreator(cachedAction)],
            [cachedAction],
          ])
        )
      ]
    },
    []
  )
}
