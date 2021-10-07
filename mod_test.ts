import { PromiseWorker } from './PromiseWorker.ts'

const worker = new PromiseWorker(new URL("./test_worker.ts", import.meta.url).href, { type: "module" })
Deno.test("Promise Marco Polo Test", async () => {
    const rtn = await worker.sendPromise('Marco ')
  
    if (rtn !== "Marco Polo") {
      throw Error("Promise did not return Marco Polo");
    }
  });


Deno.test("Error test", async () => {
    try {
        await worker.sendPromise('error')
        throw new Error("There wasn't any error!")
    } catch(error) {
        console.log(error)
    }
  });


// This test won't fail if it doesn't work. Check the console log returns to make sure that it's not detecting
Deno.test("Interference test", async () => {
    worker.postMessage('Not promise Marco')
  });

Deno.test("Performance test", async () => {
    const longstring = 'the quick brown fox jumped over'.repeat(1000000) // ~2.5 ish kb
    let t0 = performance.now()
    const performanceworker = new PromiseWorker(new URL("./test_worker.ts", import.meta.url).href, { type: "module" })
    let t1 = performance.now()
    console.log('Spawning promise worker: ', t1 - t0, 'ms')

    t0 = performance.now()
    await performanceworker.sendPromise('Marco 1 ')
    t1 = performance.now()
    console.log('Simple string: ', t1 - t0, 'ms')

    t0 = performance.now()
    await performanceworker.sendPromise({str: 'Marco 2 ', str2: longstring})
    t1 = performance.now()
    console.log('Long string promise: ', t1 - t0, 'ms')

    t0 = performance.now()
    await performanceworker.sendPromise('Marco 3 ')
    t1 = performance.now()
    console.log('Sending third promise: ', t1 - t0, 'ms')
})