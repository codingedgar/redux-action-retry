import { Middleware } from 'redux';
import { State } from '../index';
export interface MiddlewareProtocol<U = {}> {
    middleware: (initializedExtensions: any[]) => Middleware<State<U>>;
}
export declare function isMiddleware<U>(extension: any): extension is MiddlewareProtocol<U>;
