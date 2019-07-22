"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
exports.RESET = 'RESET';
function reset(_) {
    return {
        reducer: () => (state = _1.INITIAL_STATE, action) => {
            return (action.type === _1.REDUX_ACTION_RETRY && action[exports.RESET])
                ? _1.INITIAL_STATE
                : state;
        }
    };
}
exports.reset = reset;
function resetActionCreator() {
    return {
        type: _1.REDUX_ACTION_RETRY,
        [exports.RESET]: true
    };
}
exports.resetActionCreator = resetActionCreator;
