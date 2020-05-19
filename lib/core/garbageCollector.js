"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.garbageCollector = void 0;
const ramda_1 = require("ramda");
const GarbageCollectorProtocol_1 = require("./protocols/GarbageCollectorProtocol");
const RemovedProtocol_1 = require("./protocols/RemovedProtocol");
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
