export default function fibrelite(asyncFunction, totalThreads, debounce) {

    const pool = [];
    this.roundRobin = 0;
    this.totalThreads = totalThreads || 1;
    this.debounce = debounce || 333;
    this.debounceId = 0; // Keep track of debounce calls
    this.firstPrioritiseCall = true; // Prevent unecessary termination

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
        // A simple counter is used to generate worker-global unique ID's for RPC:
        let currentId = 0;

        // Outward-facing promises store their "controllers" (`[request, reject]`) here:
        const promises = {};

        // Create an "inline" worker (1:1 at definition time)
        const worker = new Worker(
            // Use a data URI for the worker's src. It inlines the target function and an RPC handler:
            'data:,$$='+asyncFunction+';onmessage='+(e => {
                /* global $$ */

                // Invoking within then() captures exceptions in the supplied async function as rejections
                Promise.resolve(e.data[1]).then(
                    v => $$.apply($$, v)
                ).then(
                    // success handler - callback(id, SUCCESS(0), result)
                    // if `d` is transferable transfer zero-copy
                    d => {
                        postMessage([e.data[0], 0, d], [d].filter(x => (
                            (x instanceof ArrayBuffer) ||
                            (x instanceof MessagePort) ||
                            (x instanceof ImageBitmap)
                        )));
                    },
                    // error handler - callback(id, ERROR(1), error)
                    er => { postMessage([e.data[0], 1, '' + er]); }
                );
            })
        );

        const thread = {
            resolved: false,
            worker: worker,
            fn : function() {
                const args = [].slice.call(arguments);
                return new Promise(function () {

                    // Add the promise controller to the registry
                    promises[++currentId] = arguments;

                    // Send an RPC call to the worker - call(id, params)
                    // The filter is to provide a list of transferables to send zero-copy
                    worker.postMessage([currentId, args], args.filter(x => (
                        (x instanceof ArrayBuffer) ||
                        (x instanceof MessagePort) ||
                        (x instanceof ImageBitmap)
                    )));
                });
            }
        };

        /** Handle RPC results/errors coming back out of the worker.
         *  Messages coming from the worker take the form `[id, status, result]`:
         *    id     - counter-based unique ID for the RPC call
         *    status - 0 for success, 1 for failure
         *    result - the result or error, depending on `status`
         */
        worker.onmessage = e => {
            // Set the current thread as resolved;
            thread.resolved = true;
            // invoke the promise's resolve() or reject() depending on whether there was an error.
            promises[e.data[0]][e.data[1]](e.data[2]);

            // ... then delete the promise controller
            promises[e.data[0]] = null;
        };

        // Return the thread to the developer
        return thread;

    }

    /** 
     * Debounce a series of calls to a Web Worker async function
     * catching the last call in a given batched time frame
     */
    this.debounce = async function() {

        const args = [].slice.call(arguments);

        // If batch has expired
        if (this.batchEnds === undefined || Date.now() >= this.batchEnds) {

            // This describes the end of the 
            // current batch of incoming executions
            this.batchEnds = Date.now() + this.debounce;

        } 

        // Keep the last arguments on record
        this.finalArgsInBatch = args;

        return new Promise((resolve) => {
            setTimeout(() => {

                if (this.finalArgsInBatch === args || this.lastExecution === undefined) {

                    this.lastExecution = this.execute.apply(this, this.finalArgsInBatch).then((result) => {
                        // When we have a known result set it to
                        // the resolved value
                        this.lastKnownResult = result;
                        return result;
                    });

                    // Resolve the new latest value function
                    resolve(this.lastExecution);

                }
                
                // If we have an intermittent known result, resolve that
                if (this.lastKnownResult !== undefined) {
                    resolve(this.lastKnownResult);
                } 

                // Else lets just resolve to the currently executing
                // function
                resolve(this.lastExecution);

            },  
            this.batchEnds - Date.now()) // The time at which to execute

        });

    }.bind(this);

    /** 
     * Kill off workers that were previously processing a request
     * in turn prioritising the latest call
     */
    this.prioritise =  async function() {
        if (!this.firstPrioritiseCall) {
            this.terminateAll();
        }  
        this.firstPrioritiseCall = false;
        return this.execute.apply(this, [].slice.call(arguments));
    }.bind(this);
    
    /** 
     * Execute the function passed to fibrelite. This is the
     * standard method to use.
     */
    this.execute = async function() {

        const args = [].slice.call(arguments);

        // Fill the thread pool
        while (pool.length < this.totalThreads) {
            pool.unshift(getThread(asyncFunction));
        }

        // Get the next thread
        const thread = pool[this.roundRobin].fn.apply(null, args);

        // Increment the thread counter
        if (this.roundRobin >= this.totalThreads - 1) {
            this.roundRobin = 0;
        } else {
            this.roundRobin++;
        }

        return thread;

    }.bind(this);

    /** 
     * Get the pool of workers that fibrelite is currently using
     */
    this.getWorkers = () => {
        return pool.concat(); // return a copy of the array
    }

    /** 
     * Kill all the currently executing workers
     */
    this.terminateAll = () => {

        if (pool.length > 0 && pool[this.totalThreads - 1].resolved === false) {

            // Remove the worker from the pool
            // and terminate it
            pool.pop().worker.terminate();
        }

    }

}

