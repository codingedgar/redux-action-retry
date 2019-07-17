import {
  Config,
  VisitorNode,
} from "../core/index";
import {
  has,
} from "ramda";

export type timesConfg = {
}

export const timesKey = 'times'

export type timesWrapAction = {
  [timesKey]: number
}

export function times(_: Config<timesConfg, timesWrapAction>): VisitorNode<timesWrapAction> {
  return {
    actionWrapper(cachedAction) {
      return {
        [timesKey]: has(timesKey, cachedAction) ? cachedAction.times + 1 : 0
      }
    }
  }
}