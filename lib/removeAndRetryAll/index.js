"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
const REMOVED_PROTOCOL_1 = require("../core/protocols/REMOVED_PROTOCOL");
exports.REMOVE_AND_RETRY_ALL = `REMOVE_AND_RETRY_ALL`;
function removeAndRetryAllActionCreator(action) {
    return {
        type: core_1.REDUX_ACTION_RETRY,
        [REMOVED_PROTOCOL_1.REMOVED]: [action],
        [core_1.RETRY_ALL]: true
    };
}
exports.removeAndRetryAllActionCreator = removeAndRetryAllActionCreator;
