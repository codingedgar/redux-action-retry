"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetActionCreator = exports.reset = exports.RESET = void 0;
const types_1 = require("./types");
exports.RESET = 'RESET';
function reset(_) {
    return {
        reducer: () => (state = types_1.INITIAL_STATE, action) => {
            return (action.type === types_1.REDUX_ACTION_RETRY && action[exports.RESET])
                ? types_1.INITIAL_STATE
                : state;
        }
    };
}
exports.reset = reset;
function resetActionCreator() {
    return {
        type: types_1.REDUX_ACTION_RETRY,
        [exports.RESET]: true
    };
}
exports.resetActionCreator = resetActionCreator;
