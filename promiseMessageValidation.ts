/* These functions are used ensure that normal messaging between the worker
 * and main thread don't get confused with promises. If you can think of a better
 * way to do this please let me know.
 */ 

const safetyString = ['jEBPfOjyBeEblWFP', 'C7r6tE0PJrI2oOH0']

/**
 * Check if message data (event.data) is a promise message
 * @param messageData data received from event.data
 * @returns true if message data a promise message, false if not
 */
export function isPromiseMessage(messageData : unknown) {
    if (messageData[safetyString[0]] && messageData[safetyString[0]] == safetyString[1]) return true
    return false
}

/**
 * Modifies outgoing promise message so that the main thread will know that it is a promise message and not a regular message
 * @param messageData the data to be modified
 * @returns a modified messageData that can be identified with isPromiseMessage
 */
export function _promiseMessageWrap(messageData : Record<string, unknown>) {
    return {...messageData, [safetyString[0]] : safetyString[1] }
}