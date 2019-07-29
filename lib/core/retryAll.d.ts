import { Config } from './types';
import { RetryAllCommand } from "./protocols/RetryAllProtocol";
import { MiddlewareProtocol } from './protocols/MiddlewareProtocol';
export declare function retryAll(config: Config): MiddlewareProtocol;
export declare function retryAllActionCreator(): RetryAllCommand;
