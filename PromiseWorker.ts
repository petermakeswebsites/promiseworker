import {isPromiseMessage, _promiseMessageWrap} from './promiseMessageValidation.ts'

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
            (update?: unknown) => void, // Update callback
            ]
        } = {}

    private handleMessage(e : MessageEvent) {
        // Check if it's relevant to the promise
        if (isPromiseMessage(e.data)) {
            // TODO: typecheck
            // TODO: Check if ID is in callback store
            const id = e.data.id
            const error = e.data.error
            const update = e.data.update

            const store = this.callbackStore[id]
            const callback = update ? store[2] : store[error]
            if (!update) delete this.callbackStore[id]
            callback(e.data.data)
        }
    }

    /**
     * Sends a message to the worker with promise logic
     * @param data the data to send to the worker
     * @param update optional callback function which can be called by the worker that does not end the promise
     * @returns A promise that will resolve when the worker responds using receivePromise()
     */
    sendPromise(data : unknown, update : (updateData : unknown) => void = (updateData) => {}) {
        const id = this.idCounter++
        this.postMessage(_promiseMessageWrap({id: id, data: data}))
        return new Promise((resolve, reject) => {
            this.callbackStore[id] = [resolve, reject, update]
        })
    }
}

/**
 * Declare in worker. Functions as the receiving end of the promise.
 * @param callback function to run - value is what is being sent by the main thread. Returned value is sent back to promise. Optionally use 'update' if you declared an update callback in the original sendPromise
 */
export function receivePromise(callback : (value : unknown, e: MessageEvent, update : (updateData : unknown) => void) => unknown) {
    self.addEventListener('message', (e) => {
        if (isPromiseMessage((e as MessageEvent).data)) { 
        
            // Needs some type checking
            const id = (e as MessageEvent).data.id
            const data = (e as MessageEvent).data.data

            let rtn
            let error = 0
            try {
                rtn = callback(data, (e as MessageEvent), (updateData : unknown) => {
                    // Update callback
                    (self as any).postMessage(_promiseMessageWrap({
                        id: id,
                        error: 0,
                        data: updateData,
                        update: 1
                    }))
                })
            } catch(err) {
                rtn = err
                error = 1
            }

            (self as any).postMessage(_promiseMessageWrap({
                id: id,
                error: error,
                data: rtn,
                update: 0
            }))
        }
    })
}