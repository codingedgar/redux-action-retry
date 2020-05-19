"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUpsertedAction = exports.upsertActionCreator = exports.upsert = exports.UPSERTED = void 0;
const ramda_1 = require("ramda");
const types_1 = require("./types");
const UpdatedProtocol_1 = require("./protocols/UpdatedProtocol");
const AppendProtocol_1 = require("./protocols/AppendProtocol");
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
                if (AppendProtocol_1.isAppendedProtocol(extension)) {
                    acc[0].push(extension[AppendProtocol_1.APPENDED_PROTOCOL]);
                }
                if (UpdatedProtocol_1.isUpdatedProtocol(extension)) {
                    acc[1].push(extension[UpdatedProtocol_1.UPDATED_PROTOCOL]);
                }
                return acc;
            }, [
                [],
                []
            ]);
            return (state = types_1.INITIAL_STATE, action) => {
                if (isUpsertedAction(action)) {
                    const coincidenceIndex = ramda_1.findIndex((cachedAction => cachedAction.action.meta[types_1.REDUX_ACTION_RETRY].id === action[exports.UPSERTED].meta[types_1.REDUX_ACTION_RETRY].id), state.cache);
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
        type: types_1.REDUX_ACTION_RETRY,
        [exports.UPSERTED]: action,
    };
}
exports.upsertActionCreator = upsertActionCreator;
function isUpsertedAction(action) {
    return exports.UPSERTED in action;
}
exports.isUpsertedAction = isUpsertedAction;
