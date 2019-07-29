import { CachedAction, RETRY_ALL, RarAction } from '../types';

export const RETRY_ALL_PROTOCOL = '@@RETRY_ALL_PROTOCOL';

export interface RetryAllProtocolFn<U = {}> {
  (action: RetryAllCommand, cachedAction: CachedAction<U>): boolean;
}
export type RetryAllProtocol<U = {}> = {
  [RETRY_ALL_PROTOCOL]: RetryAllProtocolFn<U>;
};
export type RetryAllCommand = RarAction & {
  [RETRY_ALL]: true;
};

export function isRetryAllProtocol(action: any): action is RetryAllProtocol {
  return RETRY_ALL_PROTOCOL in action
}