export default function fibrelite(asyncFunction, totalThreads) {

    const pool = [];
    this.roundRobin = 0;
    this.totalThreads = totalThreads || 1;

    // More than 20 web workers will crash most browsers
    if (this.totalThreads > 20) {
        this.totalThreads = 20;
    }

    // getThread is entirely based on Jason Millers Greenlet 
    // https://github.com/developit/greenlet

    /** Move an async function into its own thread.
     *  @param {Function} asyncFunction  An (async) function to run in a Worker.
     *  @public
     */
    const getThread = (asyncFunction) => {

        if (!this.cachedObjectUrl) {

            // The URL is a pointer to a stringified function (as a blob object)
            this.cachedObjectUrl = URL.createObjectURL(new Blob([
                // Register our wrapper function as the message handler
                'onmessage=(' + (
                    // userFunc() is the user-supplied async function
                    userFunc => e => {
                        // Invoking within then() captures exceptions in userFunc() as rejections
                        Promise.resolve(e.data[1]).then(
                            userFunc.apply.bind(userFunc, userFunc)
                        ).then(
                            // success handler - callback(id, SUCCESS(0), result)
                            d => { postMessage([e.data[0], 0, d]);},
                            // error handler - callback(id, ERROR(1), error)
                            e => { postMessage([e.data[0], 1, ''+e]); }
                        );
                    }
                ) + ')(' + asyncFunction + ')'  // pass user-supplied function to the closure
            ]))
            
        }

        // Create an "inline" worker (1:1 at definition time)
        let worker = new Worker(this.cachedObjectUrl),

            // A simple counter is used to generate worker-global unique ID's for RPC:
            currentId = 0,

            // Outward-facing promises store their "controllers" (`[request, reject]`) here:
            promises = {};


        /** Handle RPC results/errors coming back out of the worker.
         *  Messages coming from the worker take the form `[id, status, result]`:
         *    id     - counter-based unique ID for the RPC call
         *    status - 0 for success, 1 for failure
         *    result - the result or error, depending on `status`
         */

        worker.onmessage = e => {

            // invoke the promise's resolve() or reject() depending on whether there was an error.
            promises[e.data[0]][e.data[1]](e.data[2])

            // ... then delete the promise controller
            promises[e.data[0]] = null;

        };

        // Return a proxy function that forwards calls to the worker & returns a promise for the result.
        const thread = {
            resolved: false,
            worker: worker,
            fn : function(args) {
                args = [].slice.call(arguments);

                return new Promise(function() {
                    thread.resolved = false;
                    // Add the promise controller to the registry
                    promises[++currentId] = arguments;

                    // Send an RPC call to the worker - call(id, params)
                    worker.postMessage([currentId, args]);
                }).then((result) => {
                    thread.resolved = true;
                    return result;
                })
            }
        };
        return thread;

    }

    this.waitExecute = async (value) => {

        if (this.totalThreads === 1) {
            if (
                pool.length && 
                pool[0].resolved === false &&
                this.lastKnownValue !== undefined
            ) {
                // If the oldest thread hasn't resolved
                // just give back the last known value
                return this.lastKnownValue;
            }

            if (!pool.length) pool[0] = getThread(asyncFunction);
    
            this.lastKnownValue = pool[0].fn(value);
            return this.lastKnownValue;

        } else {
            throw Error("waitExecute requires only use of one worker");
        }

    }

    this.prioritiseExecute = async (value) => {

        if (pool.length > 0) {
            if (pool[this.totalThreads - 1].resolved === false) {
                // Remove the worker from the pool
                // and terminate it
                pool.pop().worker.terminate();
            }
        }
        
        return this.execute(value);
        
    }

    this.execute = async (value) => {

        while (pool.length < this.totalThreads) {
            pool.unshift(getThread(asyncFunction));
        }

        const thread = pool[this.roundRobin].fn(value);
        if (this.roundRobin >= this.totalThreads - 1) {

        } else {
            this.roundRobin++;
        }
        return thread;

    }

    this.getCurrentWorker = () => {
        return currentThread.worker;
    }

}

