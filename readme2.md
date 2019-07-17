# At least once redux saga action delivery
## The problem
My team has a mobile solution written in React Native and handling all side effects with redux saga, and we were loosing data. Why? Because our sagas were failing and we weren't able to prevent those errors.
## Other solutions
We tried many "offline queues" solutions, all based on preventing execution of sagas when the user is offline, all failed to detect internet reachability, they just check network availability.
At some point we started forking those libraries to improve the offline detection, but quickly realised React Native has no such method to try this, so we had to ping a server to see if we had reachability.
In light of this ugly truth we also encounter other problems, what if the server had an transient error ? Network reachability has nothing to do with this, we needed another mechanism to solve this issue.
## Solving Philosophy
We learnt there is no way to avoid executing the action if we know if it's going to fail. And we only found "at most once delivery with network availability optimizations" and we needed "at least once delivery". So we starting building our own.

How to assure at least once? Acknowledgements, if we dispatched an action, such will be catch in the retry mechanism to later retries and it's saga must send an acknowledgement back to the retry mechanism.

## Technology
### Building blocks
* Storing, we need to store every action we're interesting in retrying
*