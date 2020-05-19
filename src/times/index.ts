import {
  Config,
} from "../core/types";
import { UpdatedProtocol, UPDATED_PROTOCOL } from "../core/protocols/UpdatedProtocol";
import { AppendedProtocol, APPENDED_PROTOCOL } from "../core/protocols/AppendProtocol";

export type timesConfig = {
}

export const timesKey = 'times'

export type timesWrapAction = {
  [timesKey]: number
}

export function times(_: Config<timesConfig, timesWrapAction>):
  UpdatedProtocol<timesWrapAction>
  &
  AppendedProtocol<timesWrapAction> {
  return {
    [UPDATED_PROTOCOL]: (_, cachedAction) => {
      return {
        [timesKey]: cachedAction.times + 1
      }
    },
    [APPENDED_PROTOCOL]: (_) => ({
      [timesKey]: 0
    })
  }
}
