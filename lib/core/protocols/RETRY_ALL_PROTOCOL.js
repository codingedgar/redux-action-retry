"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const __1 = require("..");
exports.RETRY_ALL_PROTOCOL = '@@RETRY_ALL_PROTOCOL';
function isRetryAllProtocol(action) {
    return exports.RETRY_ALL_PROTOCOL in action;
}
exports.isRetryAllProtocol = isRetryAllProtocol;
