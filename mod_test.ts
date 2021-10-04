import { PromiseWorker } from './PromiseWorker.ts'

const worker = new PromiseWorker(new URL("./test_worker.ts", import.meta.url).href, { type: "module" })
Deno.test("Promise Marco Polo Test", async () => {
    // await some async task
    const rtn = await worker.sendPromise('Marco ')
  
    if (rtn !== "Marco Polo") {
      throw Error("Promise did not return Marco Polo");
    }
  });


Deno.test("Interference test", async () => {
    // await some async task
    worker.postMessage('Not promise Marco ')

  });