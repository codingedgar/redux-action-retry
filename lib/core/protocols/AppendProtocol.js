"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const upsert_1 = require("../upsert");
exports.APPENDED_PROTOCOL = '@@APPENDED_PROTOCOL';
function isAppendedProtocol(extension) {
    return exports.APPENDED_PROTOCOL in extension;
}
exports.isAppendedProtocol = isAppendedProtocol;
