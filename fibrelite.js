export default function fibrelite(asyncFunction, maxThreads) {

    const pool = [];
    this.maxThreads = maxThreads || 1;
    this.id = 0;

    /** Move an async function into its own thread.
     *  @param {Function} asyncFunction  An (async) function to run in a Worker.
     *  @public
     */
    const greenlet = (asyncFunction) => {

        const parent = this;

        if (!this.cachedFn) {
            this.cachedFn = 
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
                    )
                }
            ) + ')(' + asyncFunction + ')'  // pass user-supplied function to the closure
        }

        // Create an "inline" worker (1:1 at definition time)
        let worker = new Worker(
                // The URL is a pointer to a stringified function (as a blob object)
                URL.createObjectURL(
                    new Blob([this.cachedFn])
                )
            ),

            // A simple counter is used to generate worker-global unique ID's for RPC:
            currentId = 0,

            // Outward-facing promises store their "controllers" (`[request, reject]`) here:
            promises = {};

        worker.resolved = false;
        
        /** Handle RPC results/errors coming back out of the worker.
         *  Messages coming from the worker take the form `[id, status, result]`:
         *    id     - counter-based unique ID for the RPC call
         *    status - 0 for success, 1 for failure
         *    result - the result or error, depending on `status`
         */

        worker.onmessage = e => {
            // invoke the promise's resolve() or reject() depending on whether there was an error.
            promises[e.data[0]][e.data[1]](e.data[2]);

            // ... then delete the promise controller
            promises[e.data[0]] = null;

            // We don't have to terminate workers that are finished
            worker.resolved = true;
        };

        // Return a proxy function that forwards calls to the worker & returns a promise for the result.
        return {
            id : this.id++,
            worker: worker,
            fn : function(args) {
                args = [].slice.call(arguments);
                return new Promise(function() {
                    // Add the promise controller to the registry
                    promises[++currentId] = arguments;

                    // Send an RPC call to the worker - call(id, params)
                    worker.resolved = false;
                    worker.postMessage([currentId, args]);
                });
            }
        };

    }

    this.roundRobin = 0;

    this.prioritiseExecute = async (value) => {
        
        this.roundRobin++;

        if (this.roundRobin >= maxThreads - 1) {
            this.roundRobin = 0;
        }

        while (pool.length < maxThreads) {
            pool.unshift(greenlet(asyncFunction));
        }

        const oldestThread = pool.pop();
        new Promise((resolve) => {
            resolve(oldestThread.worker.terminate()); 
        });
        
        return pool[this.roundRobin].fn(value);
        
    }

    // this.prioritiseExecute = async (value) => {
    //     roundRobin++;
    //     if (roundRobin === maxThread - 1) {
    //         roundRobin = 0;
    //     }
    //     if (pool.length === 0) {
    //         const currentThread = greenlet(asyncFunction)
    //         pool.push(currentThread);
    //         return currentThread.fn(value);
    //     }

    //     if (pool.length === maxThreads) {
    //         console.log("last thread", pool[maxThreads - 1]);
    //         if (pool[maxThreads - 1].worker.resolved === false) {
    //             const oldestThread = pool.pop();
    //             new Promise((resolve) => {
    //                 resolve(oldestThread.worker.terminate()); 
    //             });
    //         }
    //     }

    //     console.log("pool", pool);
    //     if (pool.length < maxThreads) {
    //         pool.unshift(greenlet(asyncFunction));
    //     }
        
    //     return pool[0].fn(value);
        
    // }

    // this.execute = async (value) => {
    //     if (currentThread === undefined) {
    //         currentThread = greenlet(asyncFunction)
    //         return currentThread.fn(value);
    //     }
    //     return currentThread.fn(value);
    // }

    this.getCurrentWorker = () => {
        return currentThread.worker;
    }

}

