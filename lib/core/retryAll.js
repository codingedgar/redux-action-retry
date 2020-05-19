"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryAllActionCreator = exports.retryAll = void 0;
const ramda_1 = require("ramda");
const types_1 = require("./types");
const RetryAllProtocol_1 = require("./protocols/RetryAllProtocol");
function retryAll(config) {
    return {
        middleware: visitors => {
            const shouldRetryFunctions = visitors.reduce((acc, visitor) => {
                if (RetryAllProtocol_1.isRetryAllProtocol(visitor)) {
                    acc.push(visitor[RetryAllProtocol_1.RETRY_ALL_PROTOCOL]);
                }
                return acc;
            }, []);
            const shouldRetry = ramda_1.allPass(shouldRetryFunctions);
            return api => next => action => {
                if (action.type === types_1.REDUX_ACTION_RETRY && action[types_1.RETRY_ALL]) {
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
        type: types_1.REDUX_ACTION_RETRY,
        [types_1.RETRY_ALL]: true
    };
}
exports.retryAllActionCreator = retryAllActionCreator;
