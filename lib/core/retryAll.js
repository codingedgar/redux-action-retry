"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const _1 = require(".");
const RETRY_ALL_PROTOCOL_1 = require("./protocols/RETRY_ALL_PROTOCOL");
function retryAll(config) {
    return {
        middleware: visitors => {
            const shouldRetryFunctions = visitors.reduce((acc, visitor) => {
                if (RETRY_ALL_PROTOCOL_1.isRetryAllProtocol(visitor)) {
                    acc.push(visitor[RETRY_ALL_PROTOCOL_1.RETRY_ALL_PROTOCOL]);
                }
                return acc;
            }, []);
            const shouldRetry = ramda_1.allPass(shouldRetryFunctions);
            return api => next => action => {
                if (action.type === _1.REDUX_ACTION_RETRY && action[_1.RETRY_ALL]) {
                    const result = next(action);
                    const cache = ramda_1.path([config.stateKeyName, 'cache'], api.getState());
                    cache.forEach(wrap => {
                        if (shouldRetry(action, wrap)) {
                            api.dispatch(wrap.action);
                        }
                    });
                    return result;
                }
                else {
                    return next(action);
                }
            };
        }
    };
}
exports.retryAll = retryAll;
function retryAllActionCreator() {
    return {
        type: _1.REDUX_ACTION_RETRY,
        [_1.RETRY_ALL]: true
    };
}
exports.retryAllActionCreator = retryAllActionCreator;
