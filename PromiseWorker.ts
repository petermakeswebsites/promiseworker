import {isPromiseMessage, _promiseMessageWrap} from './promiseMessageValidation'

export class PromiseWorker extends Worker {

    constructor(specifier: string | URL, options?: WorkerOptions | undefined) {
        super(specifier, options)
        this.addEventListener('message', (e) => {
            this.handleMessage(e)
        })
    }

    // ID increments by one for every promise
    private idCounter = 0

    // Stores all callbacks
    private callbackStore : {
        [id : number]:[
            (value : unknown) => void, // Success callback
            (reason?: unknown) => void, // Fail callback
            ]
        } = {}

    private handleMessage(e : MessageEvent) {
        // Check if it's relevant to the promise
        if (isPromiseMessage(e.data)) {
            // TODO: typecheck
            // TODO: Check if ID is in callback store
            const id = e.data.id
            const error = e.data.error

            const store = this.callbackStore[id]
            const callback = store[error]
            delete this.callbackStore[id]
            callback(e.data.data)
        }
    }

    /**
     * Sends a message to the worker with promise logic
     * @param data the data to send to the worker
     * @param update a callback function which can be called by the worker that does not end the promise
     * @returns 
     */
    sendPromise(data : unknown) {
        const id = this.idCounter++
        this.postMessage(_promiseMessageWrap({id: id, data: data}))
        return new Promise((resolve, reject) => {
            this.callbackStore[id] = [resolve, reject]
        })
    }
}

/**
 * Declare in worker. Functions as the receiving end of the promise.
 * @param callback function to run - value is what is being sent by the main thread. Returned value is sent back to promise
 */
export function receivePromise(callback : (value, e?: MessageEvent) => unknown) {
    self.addEventListener('message', (e) => {
        if (isPromiseMessage(e.data)) { 
        
            // Needs some type checking
            const id = e.data.id
            const data = e.data.data

            let rtn
            let error = 0
            try {
                rtn = callback(data, e)
            } catch(err) {
                rtn = err
                error = 1
            }

            self.postMessage(_promiseMessageWrap({
                id: id,
                error: error,
                data: rtn
            }))
        }
    })
}