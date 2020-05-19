"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRetryMechanism = void 0;
const ramda_1 = require("ramda");
const types_1 = require("./types");
const upsert_1 = require("./upsert");
const reset_1 = require("./reset");
const remove_1 = require("./remove");
const retryAll_1 = require("./retryAll");
const ReducerProtocol_1 = require("./protocols/ReducerProtocol");
const MiddlewareProtocol_1 = require("./protocols/MiddlewareProtocol");
const garbageCollector_1 = require("./garbageCollector");
function createRetryMechanism(initConfig) {
    const defaultConfig = {
        stateKeyName: types_1.REDUX_ACTION_RETRY,
        cache: {},
        extensions: [
            upsert_1.upsert,
            reset_1.reset,
            remove_1.remove,
            retryAll_1.retryAll,
            garbageCollector_1.garbageCollector
        ]
    };
    const config = ramda_1.mergeWithKey((k, l, r) => k === 'extensions' ? [...l, ...r] : r, defaultConfig, initConfig);
    const hotExtensions = config.extensions.map(e => e(config));
    const [protocols, visitors, middlewares] = hotExtensions.reduce((acc, ext) => {
        if (ReducerProtocol_1.isReducerProtocol(ext)) {
            acc[0].push(ext);
        }
        acc[1].push(ext);
        if (MiddlewareProtocol_1.isMiddleware(ext)) {
            acc[2].push(ext);
        }
        return acc;
    }, [[], [], []]);
    const reducers = protocols.reduce((acc, protocol) => {
        acc.push(protocol.reducer(visitors));
        return acc;
    }, []);
    return {
        stateKeyName: config.stateKeyName,
        reducer: function (state = types_1.INITIAL_STATE, action) {
            return reducers.reduce((s, fn) => fn(s, action), state);
        },
        reduxActionRetryMiddlewares: [
            ...middlewares.map(m => m.middleware(visitors)),
        ]
    };
}
exports.createRetryMechanism = createRetryMechanism;
