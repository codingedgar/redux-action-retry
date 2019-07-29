import {
  allPass,
  path,
} from 'ramda';
import {
  Config,
  REDUX_ACTION_RETRY,
  RETRY_ALL,
  CachedAction,
} from './types';

import { RETRY_ALL_PROTOCOL, RetryAllProtocolFn, isRetryAllProtocol, RetryAllCommand } from "./protocols/RetryAllProtocol";

import { MiddlewareProtocol } from './protocols/MiddlewareProtocol';

export function retryAll(config: Config): MiddlewareProtocol {

  return {
    middleware: visitors => {

      const shouldRetryFunctions = visitors.reduce<RetryAllProtocolFn[]>(
        (acc, visitor) => {

          if (isRetryAllProtocol(visitor)) {
            acc.push(visitor[RETRY_ALL_PROTOCOL])
          }

          return acc
        },
        []
      )

      const shouldRetry = allPass(shouldRetryFunctions)

      return api => next => action => {

        if (action.type === REDUX_ACTION_RETRY && action[RETRY_ALL]) {

          const result = next(action)
          const cache = path<CachedAction[]>([config.stateKeyName, 'cache'], api.getState())

          cache!.forEach(wrap => {
            if (shouldRetry(action, wrap)) {
              api.dispatch(wrap.action)
            }
          })

          return result;
        } else {
          return next(action)
        }
      }
    }
  }
}

export function retryAllActionCreator(): RetryAllCommand {
  return {
    type: REDUX_ACTION_RETRY,
    [RETRY_ALL]: true
  }
}