import { UPSERTED } from '../upsert';
import { RarAction, REDUX_ACTION_RETRY, CacheableAction } from '../types';

export const APPENDED_PROTOCOL = '@@APPENDED_PROTOCOL';

export interface AppendedProtocolFn<U = {}> {
  (action: UpsertedAction): U;
}

export type AppendedProtocol<U = {}> = {
  [APPENDED_PROTOCOL]: AppendedProtocolFn<U>;
};

export type UpsertedAction = RarAction & {
  type: typeof REDUX_ACTION_RETRY;
  [UPSERTED]: CacheableAction;
};

export function isAppendedProtocol<U = {}>(extension: any): extension is AppendedProtocol<U> {
  return APPENDED_PROTOCOL in extension;
}