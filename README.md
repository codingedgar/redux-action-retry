<h2 align="center">At least once delivery of Redux Actions</h2>

# Installation

```bash
yarn add redux-action-retry
```

# Getting Started
## Basic Configuration

```typescript
import {
  createRetryMechanism,
} from 'redux-action-retry';

import {
  createStore,
  combineReducers,
  applyMiddleware,
} from 'redux';

// actions to retry
const SEND_LOGS_TO_SERVER = 'SEND_LOGS_TO_SERVER';
const NOTIFY_ACTION = 'NOTIFY_ACTION';

const { reducer, reduxActionRetryMiddleware, stateKeyName } = createRetryMechanism({
  cache: {
    [SEND_LOGS_TO_SERVER]: {
      type: SEND_LOGS_TO_SERVER,
    },
    [NOTIFY_ACTION]: {
      type: NOTIFY_ACTION,
    },
  },
});

export const store = createStore(
  combineReducers({
    [stateKeyName]: reducer
  }),
  applyMiddleware
    (
      ...reduxActionRetryMiddleware,
    )
);
```

## Basic Usage

When actions are dispatched, the middleware immediately caches the action, if the action is successful you can remove it dispatching a remove action.

```typescript
import { put } from 'redux-saga/effects'
import {
  removeActionCreator,
} from 'redux-action-retry';

function* sendLogsToServer(action) {
  // domain logic

  // all good
  yield put(removeActionCreator(action))
}
```

When retrying is needed you can dispatch a retry all action

```typescript
import { put } from 'redux-saga/effects'
import {
  retryAllActionCreator,
} from 'redux-action-retry';

function* appForeground() {
  // other actions

  // retry all cached actions
  yield put(retryAllActionCreator())
}
```