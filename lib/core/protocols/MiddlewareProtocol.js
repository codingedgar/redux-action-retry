"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMiddleware = void 0;
function isMiddleware(extension) {
    return 'middleware' in extension;
}
exports.isMiddleware = isMiddleware;
