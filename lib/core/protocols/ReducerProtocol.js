"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReducerProtocol = void 0;
function isReducerProtocol(extension) {
    return 'reducer' in extension;
}
exports.isReducerProtocol = isReducerProtocol;
