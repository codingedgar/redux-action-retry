// import {
//   reject,
//   over,
//   anyPass,
//   find,
// } from 'ramda';
// import {
//   Config,
//   State,
//   INITIAL_STATE,
//   REDUX_ACTION_RETRY,
//   CachedAction,
//   CacheableAction,
//   RarAction,
// } from '.';

// import { AnyAction } from 'redux';
// import { cacheLens } from './utils';
// import { COLLECT_GARBAGE, isCollectGarbaseCommand } from './protocols/garbageCollectorProtocol';

// export function garbageCollector(_config: Config) {
//   return {
//     mi: () =>
//       (state: State = INITIAL_STATE, action: AnyAction): State => {
//         if (isCollectGarbaseCommand(action)) {

//           return over(
//             cacheLens,
//             reject<CachedAction>(
//               anyPass([
//                 cachedAction => !!find(
//                   removedAction => {
//                     return removedAction.meta[REDUX_ACTION_RETRY].id === cachedAction.action.meta[REDUX_ACTION_RETRY].id
//                   }
//                   , action[REMOVED]),
//               ])
//             ),
//             state
//           )

//         }

//         return state

//       }
//   }
// }


import {
  allPass,
  anyPass,
  path,
  filter,
  isEmpty,
  into,
  map,
  compose,
} from 'ramda';
import {
  Config,
  CachedAction,
} from '.';

import { MiddlewareProtocol } from './protocols/MiddlewareProtocol';
import {
  isGarbageCollectorProtocol,
  GARBAGE_COLLECTOR_PROTOCOL,
  GarbageCollectorProtocolFn,
  isCollectGarbageCommand,
} from './protocols/garbageCollectorProtocol';
import { removeActionsCreator } from './protocols/RemovedProtocol';
import { CacheableAction } from './types';
// import anyPass from 'ramda/es/anyPass';

export function garbageCollector(config: Config): MiddlewareProtocol {

  return {
    middleware: visitors => {

      const protocolVisitors = visitors.reduce<GarbageCollectorProtocolFn[]>(
        (acc, visitor) => {

          if (isGarbageCollectorProtocol(visitor)) {
            acc.push(visitor[GARBAGE_COLLECTOR_PROTOCOL])
          }

          return acc
        },
        []
      )

      const shouldCollect = anyPass(protocolVisitors)

      return api => next => action => {

        if (isCollectGarbageCommand(action)) {

          const result = next(action)
          const cache = path<CachedAction[]>([config.stateKeyName, 'cache'], api.getState())

          const actionsToRemove: CacheableAction[] = into<any>(
            [],
            compose<any, any, any>(
              filter(shouldCollect),
              map<CachedAction, CacheableAction>((x) => x.action)
            ),
            cache!);

          if (!isEmpty(actionsToRemove)) {
            api.dispatch(removeActionsCreator(actionsToRemove))
          }

          // const aaa = cache!.reduce(
          //   (acc, cachedAction) => {
          //     if (shouldRetry(action, cachedAction)) {
          //       api.dispatch(cachedAction.action)
          //     }
          //   },
          //   {}
          // )

          return result;
        } else {
          return next(action)
        }
      }
    }
  }
}