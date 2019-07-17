"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../core");
exports.REMOVE_AND_RETRY_ALL = `REMOVE_AND_RETRY_ALL`;
function removeAndRetryAllActionCreator(action) {
    return {
        type: core_1.REDUX_ACTION_RETRY,
        [core_1.REMOVE]: action,
        [core_1.RETRY_ALL]: true
    };
}
exports.removeAndRetryAllActionCreator = removeAndRetryAllActionCreator;
