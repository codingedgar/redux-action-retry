import { CachedAction } from '../types';
import { UpsertedAction } from './AppendProtocol';
export declare const UPDATED_PROTOCOL = "@@UPDATED_PROTOCOL";
export interface UpdatedProtocolFn<U = {}> {
    (action: UpsertedAction, cachedAction: CachedAction<U>): U;
}
export declare type UpdatedProtocol<U> = {
    [UPDATED_PROTOCOL]: UpdatedProtocolFn<U>;
};
export declare function isUpdatedProtocol<U = {}>(visitor: any): visitor is UpdatedProtocol<U>;
