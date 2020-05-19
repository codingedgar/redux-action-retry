"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = void 0;
const ramda_1 = require("ramda");
const types_1 = require("./types");
const utils_1 = require("./utils");
const RemovedProtocol_1 = require("./protocols/RemovedProtocol");
function remove(_config) {
    return {
        reducer: () => (state = types_1.INITIAL_STATE, action) => {
            if (RemovedProtocol_1.isRemovedEvent(action)) {
                return ramda_1.over(utils_1.cacheLens, ramda_1.reject(ramda_1.anyPass([
                    cachedAction => !!ramda_1.find(removedAction => {
                        return removedAction.meta[types_1.REDUX_ACTION_RETRY].id === cachedAction.action.meta[types_1.REDUX_ACTION_RETRY].id;
                    }, action[RemovedProtocol_1.REMOVED]),
                ])), state);
            }
            return state;
        }
    };
}
exports.remove = remove;
