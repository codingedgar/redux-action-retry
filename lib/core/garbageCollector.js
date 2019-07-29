"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
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
const ramda_1 = require("ramda");
const GarbageCollectorProtocol_1 = require("./protocols/GarbageCollectorProtocol");
const RemovedProtocol_1 = require("./protocols/RemovedProtocol");
// import anyPass from 'ramda/es/anyPass';
function garbageCollector(config) {
    return {
        middleware: visitors => {
            const protocolVisitors = visitors.reduce((acc, visitor) => {
                if (GarbageCollectorProtocol_1.isGarbageCollectorProtocol(visitor)) {
                    acc.push(visitor[GarbageCollectorProtocol_1.GARBAGE_COLLECTOR_PROTOCOL]);
                }
                return acc;
            }, []);
            const shouldCollect = ramda_1.anyPass(protocolVisitors);
            return api => next => action => {
                if (GarbageCollectorProtocol_1.isCollectGarbageCommand(action)) {
                    const result = next(action);
                    const cache = ramda_1.path([config.stateKeyName, 'cache'], api.getState());
                    const actionsToRemove = ramda_1.into([], ramda_1.compose(ramda_1.filter(shouldCollect), ramda_1.map((x) => x.action)), cache);
                    if (!ramda_1.isEmpty(actionsToRemove)) {
                        api.dispatch(RemovedProtocol_1.removeActionsCreator(actionsToRemove));
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
                }
                else {
                    return next(action);
                }
            };
        }
    };
}
exports.garbageCollector = garbageCollector;
