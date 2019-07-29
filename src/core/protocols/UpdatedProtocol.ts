import { CachedAction } from '../types';
import { UpsertedAction } from './AppendProtocol';

export const UPDATED_PROTOCOL = '@@UPDATED_PROTOCOL';
export interface UpdatedProtocolFn<U = {}> {
  (action: UpsertedAction, cachedAction: CachedAction<U>): U;
}
export type UpdatedProtocol<U> = {
  [UPDATED_PROTOCOL]: UpdatedProtocolFn<U>;
};

export function isUpdatedProtocol<U = {}>(visitor: any): visitor is UpdatedProtocol<U> {
  return UPDATED_PROTOCOL in visitor;
}