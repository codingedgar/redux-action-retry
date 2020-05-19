"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isGarbageCollectorProtocol = exports.isCollectGarbageCommand = exports.collectGarbageActionCreator = exports.COLLECT_GARBAGE = exports.GARBAGE_COLLECTOR_PROTOCOL = void 0;
const types_1 = require("../types");
exports.GARBAGE_COLLECTOR_PROTOCOL = '@@GARBAGE_COLLECTOR_PROTOCOL';
exports.COLLECT_GARBAGE = 'COLLECT_GARBAGE';
function collectGarbageActionCreator() {
    return {
        type: types_1.REDUX_ACTION_RETRY,
        [exports.COLLECT_GARBAGE]: true,
    };
}
exports.collectGarbageActionCreator = collectGarbageActionCreator;
function isCollectGarbageCommand(action) {
    return exports.COLLECT_GARBAGE in action;
}
exports.isCollectGarbageCommand = isCollectGarbageCommand;
function isGarbageCollectorProtocol(action) {
    return exports.GARBAGE_COLLECTOR_PROTOCOL in action;
}
exports.isGarbageCollectorProtocol = isGarbageCollectorProtocol;
