"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = require("ramda");
const _1 = require(".");
const utils_1 = require("./utils");
const RemovedProtocol_1 = require("./protocols/RemovedProtocol");
function remove(_config) {
    return {
        reducer: () => (state = _1.INITIAL_STATE, action) => {
            if (RemovedProtocol_1.isRemovedEvent(action)) {
                return ramda_1.over(utils_1.cacheLens, ramda_1.reject(ramda_1.anyPass([
                    cachedAction => !!ramda_1.find(removedAction => {
                        return removedAction.meta[_1.REDUX_ACTION_RETRY].id === cachedAction.action.meta[_1.REDUX_ACTION_RETRY].id;
                    }, action[RemovedProtocol_1.REMOVED]),
                ])), state);
            }
            return state;
        }
    };
}
exports.remove = remove;
