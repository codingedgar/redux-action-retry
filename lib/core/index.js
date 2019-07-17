"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
exports.INITIAL_STATE = {
    cache: []
};
exports.REDUX_ACTION_RETRY = 'REDUX_ACTION_RETRY';
exports.RESET = `RESET`;
exports.RETRY_ALL = `RETRY_ALL`;
exports.REMOVE = `REMOVE`;
function resetActionCreator() {
    return {
        type: exports.REDUX_ACTION_RETRY,
        [exports.RESET]: true
    };
}
exports.resetActionCreator = resetActionCreator;
function removeActionCreator(action) {
    return {
        type: exports.REDUX_ACTION_RETRY,
        [exports.REMOVE]: action
    };
}
exports.removeActionCreator = removeActionCreator;
function retryAllActionCreator() {
    return {
        type: exports.REDUX_ACTION_RETRY,
        [exports.RETRY_ALL]: true
    };
}
exports.retryAllActionCreator = retryAllActionCreator;
exports.cacheLens = ramda_1.lensProp('cache');
function createRetryMechanishm(initConfig) {
    const defaultConfig = {
        stateKeyName: exports.REDUX_ACTION_RETRY,
        cache: {},
        extensions: [
            upsert,
            reset,
            remove,
        ]
    };
    const config = ramda_1.mergeWithKey((k, l, r) => k === 'extensions' ? [...l, ...r] : r, defaultConfig, initConfig);
    const { shouldRetryFunctions, reducers, } = config.extensions.reduce((acc, extension) => {
        const c = extension(config);
        if (c.shouldRetryAction) {
            acc.shouldRetryFunctions.push(c.shouldRetryAction);
        }
        if (c.reducer) {
            acc.reducers.push(c.reducer);
        }
        return acc;
    }, {
        shouldRetryFunctions: [],
        reducers: [],
    });
    const shouldRetry = ramda_1.allPass(shouldRetryFunctions);
    return {
        stateKeyName: config.stateKeyName,
        reducer: (state = exports.INITIAL_STATE, action) => {
            return reducers.reduce((s, fn) => fn(s, action), state);
        },
        reduxActionRetryMiddleware: ({ getState, dispatch }) => next => (action) => {
            if (action.type === exports.REDUX_ACTION_RETRY && action[exports.RETRY_ALL]) {
                const result = next(action);
                const cache = ramda_1.path([config.stateKeyName, 'cache'], getState());
                cache.forEach(wrap => {
                    if (shouldRetry(action, wrap)) {
                        dispatch(wrap.action);
                    }
                });
                return result;
            }
            else {
                return next(action);
            }
        }
    };
}
exports.createRetryMechanishm = createRetryMechanishm;
function reset(_) {
    return {
        reducer: (state = exports.INITIAL_STATE, action) => {
            return (action.type === exports.REDUX_ACTION_RETRY && action[exports.RESET])
                ? exports.INITIAL_STATE
                : state;
        }
    };
}
function remove(_) {
    return {
        reducer: (state = exports.INITIAL_STATE, action) => {
            if (action.type === exports.REDUX_ACTION_RETRY && action[exports.REMOVE]) {
                return ramda_1.over(exports.cacheLens, ramda_1.reject(cachedAction => cachedAction.action.meta[exports.REDUX_ACTION_RETRY].id === action[exports.REMOVE].meta[exports.REDUX_ACTION_RETRY].id), state);
            }
            return state;
        }
    };
}
function upsert(config) {
    const { actionWrapperFuns, } = config.extensions.reduce((acc, extension) => {
        if (extension != upsert) {
            const c = extension(config);
            if (c.actionWrapper) {
                acc.actionWrapperFuns.push(c.actionWrapper);
            }
        }
        return acc;
    }, {
        actionWrapperFuns: [],
    });
    return {
        reducer: (state, action) => {
            if (config.cache[action.type]) {
                const coincidenceIndex = ramda_1.findIndex((cachedAction => cachedAction.action.meta[exports.REDUX_ACTION_RETRY].id === action.meta[exports.REDUX_ACTION_RETRY].id), state.cache);
                const baseActionWrap = (coincidenceIndex < 0)
                    ? { action }
                    : state.cache[coincidenceIndex];
                const actionWrap = ramda_1.converge((...a) => ramda_1.mergeAll(a), [ramda_1.identity, ...actionWrapperFuns])(baseActionWrap);
                return ramda_1.over(exports.cacheLens, (cache) => (coincidenceIndex < 0)
                    ? ramda_1.append(actionWrap, cache)
                    : ramda_1.set(ramda_1.lensIndex(coincidenceIndex), actionWrap)(cache), state);
            }
            return state;
        }
    };
}
