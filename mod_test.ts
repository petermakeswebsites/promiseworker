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
    // await some async task
    worker.postMessage('Not promise Marco ')

  });