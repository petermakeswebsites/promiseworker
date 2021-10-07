# Promise Worker for Deno

Please note: this is an initial build, it may not even work.
Deno promise wrapper for web workers

## Usage


Please familiarize yourself with [Deno workers](https://deno.land/manual/runtime/workers) beforehand!

In main thread:

```typescript
import {PromiseWorker} from 'https://deno.land/x/promiseworker/mod.ts'

const poloPromise = new PromiseWorker(new URL("./worker.ts", import.meta.url).href, { type: "module" })

console.log(await poloPromise.sendPromise('Marco')) // Output: MarcoPolo
```

In `worker.ts`

```typescript
import {receivePromise} from 'https://deno.land/x/promiseworker/mod.ts'

receivePromise((message) => {
    return message + 'Polo'
})
```

### Error Handling

If an error is thrown in the `receivePromise` callback defined in `worker.ts`, the promise will fail properly.

Main thread:

```typescript
try {
    console.log(await poloPromise.sendPromise('Marco is lost')) // Output: MarcoPolo
} catch(error) {
    console.log(error) // Returns Error! Marco is Lost!
}
```

Obviously you can also use `sendPromise(...).then(...).catch(...)`

In `worker.ts`

```typescript
receivePromise((message) => {
    if (message == 'Marco is lost') { throw new Error('Error! Marco is lost!')}
    return message + 'Polo'
})
```

### Update Feature

You have the option to pass an callback function through `sendPromise` which can then be called by `receivePromise` in the worker without ending the promise. Currently, when the update function is called through the worker, it will not receive any kind of response of from the main thread. You send it and forget it.

You can call update as many times as you like from the worker.

Main thread:

```typescript
const result = await poloPromise.sendPromise('Marco '), (updateData) => {
    console.log('Got an update! ', updateData) // Output: Got an update! This is an update from the worker
})
console.log(result) // Output: Marco Polo
```

In `worker.ts`

```typescript
receivePromise((message, e, update) => {
    update('This is an update from the worker'!)
    return message + 'Polo'
})
```
