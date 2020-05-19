"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRetryAllProtocol = exports.RETRY_ALL_PROTOCOL = void 0;
const types_1 = require("../types");
exports.RETRY_ALL_PROTOCOL = '@@RETRY_ALL_PROTOCOL';
function isRetryAllProtocol(action) {
    return exports.RETRY_ALL_PROTOCOL in action;
}
exports.isRetryAllProtocol = isRetryAllProtocol;
