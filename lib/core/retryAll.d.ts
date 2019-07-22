import { Config } from '.';
import { RetryAllCommand } from "./protocols/RETRY_ALL_PROTOCOL";
import { MiddlewareProtocol } from './protocols/MiddlewareProtocol';
export declare function retryAll(config: Config): MiddlewareProtocol;
export declare function retryAllActionCreator(): RetryAllCommand;
