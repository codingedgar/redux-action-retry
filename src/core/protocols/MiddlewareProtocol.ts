import { Middleware } from 'redux';
import { State } from '../types';

export interface MiddlewareProtocol<U = {}> {
  middleware: (initializedExtensions: any[]) => Middleware<State<U>>;
}

export function isMiddleware<U>(extension: any): extension is MiddlewareProtocol<U> {
  return 'middleware' in extension
}