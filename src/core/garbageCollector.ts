import {
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
} from './types';

import { MiddlewareProtocol } from './protocols/MiddlewareProtocol';
import {
  isGarbageCollectorProtocol,
  GARBAGE_COLLECTOR_PROTOCOL,
  GarbageCollectorProtocolFn,
  isCollectGarbageCommand,
} from './protocols/GarbageCollectorProtocol';
import { removeActionsCreator } from './protocols/RemovedProtocol';
import { CacheableAction } from './types';

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