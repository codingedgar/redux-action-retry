"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UPDATED_PROTOCOL = '@@UPDATED_PROTOCOL';
function isUpdatedProtocol(visitor) {
    return exports.UPDATED_PROTOCOL in visitor;
}
exports.isUpdatedProtocol = isUpdatedProtocol;
