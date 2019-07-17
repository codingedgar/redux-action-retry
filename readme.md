first try

- interesting actions must be cached (interesting action -> cached action)
- cached actions can be retried individually by id (not real use case) (cached action -> retrying action -> invisible cached action)
- all cached actions can be retried all at once (all cached actions -> retrying actions -> invisible actions)
- retrying actions can be swalled to never hit the reducer (retrying actions -> swalled actions -> invisible cached actions)
- cached action can be removed from the cache by id (cached action -> removed action)
- cached actions shouln't be retried if retrying (on the fly) ()
- retrying (flying) actions have a maximun time of hidding from retrying its cached counterpart ()
- flying actions can fail fast resseting the throttle time ()

BASIC

- interesting actions must be cached
- all cached actions can be retried all at once
- cached action can be removed from the cache by id

OPTIMIZATION : avoid retrying one action that is already on the fly

- cached action should be unable to retry for a period of time (cooling/throttle/invisible time)(matched with the maximun possible time an executing action could take to complete)
- flying actions can fail fast resseting the throttle/cooling/invisible time

OPTIMIZATION : remove never successful actions from cache (janitor/ttl)

- after a period of time, cached action are removed automatically (no recaching)

OPTIMIZATION : hit the reducer only once (optimistic ui, only retry side effects)

- executing actions can be swalled to never hit the reducer

PATTERS
- retry on application focus
- retry on last success
- max cooling time to maximun possible time an executing action could take to compleate
- optimistic ui


TERMINOLOGY
- not target actions
- target actions
- cached actions
- 

STATES OF ACTIONS

- incoming
- cooling / cached
- retriable
- flying
- old
- silent (consumed)
- removed

TRANSITIONS OF ACTIONS
- target action -> 

FEATURES

- cooling
- caching
- retry all
- remove one


- 