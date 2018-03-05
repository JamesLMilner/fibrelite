# Fibrelite

Seamlessly use [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to offload work that could block user interaction and page rendering. 

With fibrelite you can turn any async function into a Web Worker. Fibrelite has three core approaches to handling work:

* Execute: Execute an async function as a Web Worker
* Debounce: Only run the an async function on last value in a batch of incoming operations 
* Prioritise: Run all incoming operations but kill off workers as new operations come in

## Example

Check out fibrelite in action [here](https://jamesmilneruk.github.io/fibrelite/).

## TODO:

* Tests
* More use cases / examples
* Performance review

## Acknowledgements

A massive thanks to Jason Miller for the [Greenlet library](https://github.com/developit/greenlet) on which this is heavily based and inspired.

# License

MIT