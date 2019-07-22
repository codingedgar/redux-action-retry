"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const _1 = require(".");
const _2 = require(".");
const UPDATED_PROTOCOL_1 = require("./protocols/UPDATED_PROTOCOL");
const APPENDED_PROTOCOL_1 = require("./protocols/APPENDED_PROTOCOL");
const utils_1 = require("./utils");
exports.UPSERTED = 'UPSERTED';
function upsert(config) {
    return {
        middleware: () => api => next => action => {
            if (config.cache[action.type]) {
                api.dispatch(upsertActionCreator(action));
                return next(action);
            }
            return next(action);
        },
        reducer: (initializedExtensions) => {
            const [appendedProtocols, updatedProtocols,] = initializedExtensions.reduce((acc, extension) => {
                if (APPENDED_PROTOCOL_1.isAppendedProtocol(extension)) {
                    acc[0].push(extension[APPENDED_PROTOCOL_1.APPENDED_PROTOCOL]);
                }
                if (UPDATED_PROTOCOL_1.isUpdatedProtocol(extension)) {
                    acc[1].push(extension[UPDATED_PROTOCOL_1.UPDATED_PROTOCOL]);
                }
                return acc;
            }, [
                [],
                []
            ]);
            return (state = _2.INITIAL_STATE, action) => {
                if (isUpsertedAction(action)) {
                    const coincidenceIndex = ramda_1.findIndex((cachedAction => cachedAction.action.meta[_1.REDUX_ACTION_RETRY].id === action[exports.UPSERTED].meta[_1.REDUX_ACTION_RETRY].id), state.cache);
                    const actionWrap = (coincidenceIndex < 0)
                        ? appendedProtocols.reduce((acc, fn) => ({
                            ...acc,
                            ...fn(action),
                        }), { action: action[exports.UPSERTED] })
                        : updatedProtocols.reduce((acc, fn) => ({
                            ...acc,
                            ...fn(action, acc),
                        }), state.cache[coincidenceIndex]);
                    return ramda_1.over(utils_1.cacheLens, (cache) => (coincidenceIndex < 0)
                        ? ramda_1.append(actionWrap, cache)
                        : ramda_1.set(ramda_1.lensIndex(coincidenceIndex), actionWrap)(cache), state);
                }
                return state;
            };
        },
    };
}
exports.upsert = upsert;
function upsertActionCreator(action) {
    return {
        type: _1.REDUX_ACTION_RETRY,
        [exports.UPSERTED]: action,
    };
}
exports.upsertActionCreator = upsertActionCreator;
function isUpsertedAction(action) {
    return exports.UPSERTED in action;
}
exports.isUpsertedAction = isUpsertedAction;
