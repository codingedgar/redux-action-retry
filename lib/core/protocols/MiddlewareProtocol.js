"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isMiddleware(extension) {
    return 'middleware' in extension;
}
exports.isMiddleware = isMiddleware;
