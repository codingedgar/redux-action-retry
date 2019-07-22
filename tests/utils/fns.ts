import {
  last,
  identity,
  converge,
  map,
  zipWith,
  pipe,
  unnest,
} from 'ramda';
import { upsertActionCreator } from '../../src/core/upsert';

export const Actions2RetryAllDispatchPattern = converge(
  pipe(zipWith((l, r) => [[l], [r]]), unnest),
  [
    map(upsertActionCreator),
    identity,
  ])