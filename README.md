# Fibrelite

Seamlessly use [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to offload work that could block user interaction and page rendering.

With Fibrelite you can turn any async function into a Web Worker. Fibrelite has three core strategies to executing work:

* **Execute**: run an async function as a Web Worker
* **Debounce**: Only run the an async function on last set of arguments in a batch of incoming operations
* **Prioritise**: Run all incoming operations but kill off workers as new operations come in

## Demo

Check out Fibrelite in action [here](https://jamesmilneruk.github.io/fibrelite/). This is a hosted version of the `index.html` and `example.js` inside this repository.

## Usage


#### Install

For npm:

```
npm install fibrelite
```

Or for yarn:

```
yarn add fibrelite
```

#### CDN

Alternatively you can use the unpkg [CDN](https://www.cloudflare.com/learning/cdn/what-is-a-cdn/) like so:

```html
<script src="https://unpkg.com/fibrelite@2.0.1/dist/fibrelite.js"></script>
```

#### Using Fibrelite

Fibrelite takes three arguments, the second two are optional:

```javascript
const worker = new fibrelite(asyncHello, numberOfWorkersInPool, debounceInMilliseconds);
```

Changing numberOfWorkersInPool will make use of a pool of workers in for running you async function (defaults to 1). If you want to change the debounce period for `worker.debounce` you can set `debounceInMilliseconds` (defaults to 333 milliseconds).

You can use Fibrelite like this:

```javascript
(async() => {

    const asyncHello = async (input) => {
        return "Hello " + input;
    };
    const worker = new fibrelite(asyncHello);
    const response = await worker.execute("World!");
    // const response = await worker.debounce("World!");
    // const response = await worker.prioritise("World!");
    console.log(response); // logs 'Hello World!'

})(); // await calls must be wrapped in an async function
```

## Development

To build Fibrelite you can run:

```
npm run build
```

To watch for file changes and build:

```
npm run watch
```

To run tests you can do:

```
npm run test
```

For convenience you can run the example using [live-server](https://www.npmjs.com/package/live-server) using:

```
npm run serve
```

## Acknowledgements

A massive thanks to Jason Miller for the [Greenlet library](https://github.com/developit/greenlet) on which this is heavily based and inspired.

# License

MIT
