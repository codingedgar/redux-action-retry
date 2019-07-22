"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.REMOVED_PROTOCOL = '@@REMOVED_PROTOCOL';
exports.REMOVED = 'REMOVED';
function removeActionCreator(action) {
    return {
        type: __1.REDUX_ACTION_RETRY,
        [exports.REMOVED]: [action]
    };
}
exports.removeActionCreator = removeActionCreator;
function isRemovedEvent(action) {
    return exports.REMOVED in action;
}
exports.isRemovedEvent = isRemovedEvent;
