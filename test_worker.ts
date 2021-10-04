import {receivePromise} from './PromiseWorker.ts'
import {isPromiseMessage} from './promiseMessageValidation.ts'

receivePromise((message) => {
    console.log('Detect promise!')
    if (message == 'error') { throw new Error('Error in worker!')}
    return message + 'Polo'
})

// @ts-ignore TS doesn't understand we're in a worker
self.addEventListener('message', (e : MessageEvent) => {
    console.log('Detected message event')
    if(!isPromiseMessage(e.data)) {
        console.log('Detected NOT promise!', e.data)
    }
})