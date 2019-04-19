sequencer
===

Run promises one after the other.

# Install

```bash
npm install promise-sequencer
```

# Usage

```js
import sequencer from 'promise-sequencer';
```

# Promise

If you use standard promises, you have the method `all()` that will run a batch of promises independently from one to the other. `sequencer` will run them one by one, stopping if one in the stack fails.

# Usage

```js
sequencer(

  () => new Promise(resolve => resolve(1)),

  () => new Promise(resolve => resolve(true))

);
```

Second promise is run only after and if first promise has resolved.

# Rejections

A rejection would stop the stack.

```js
sequencer(

  () => new Promise((resolve, reject) => reject(new Error('Bug!'))),

  () => new Promise(resolve => resolve(true))

);
```

Here, the second promise is never called.

# Piping promises

The output of a promise is passed down to the next promise in stack:

```js
sequencer(

  () => new Promise(resolve => resolve(1)),

  number => new Promise(() => {
    console.log(number); // 1
  })

);
```

You can also use a second argument, which is the current buffer of all outputs so far in stack.

```js
sequencer(

  () => new Promise(resolve => resolve(1)),

  () => new Promise(resolve => resolve(2)),

  (number, results) => new Promise(resolve => {
    console.log(number); // 2
    console.log(results); // [1, 2]
    resolve();
  })

);
```

# Chain

sequencer returns a promise itself. The arguments of the results of all the stack.

```js
sequencer(

  () => new Promise(resolve => resolve(1)),

  () => new Promise(resolve => resolve(2))

)
.then(results => {
  console.log(results); // [1, 2]
})
.catch(error => { /*...*/ });
```

If you want the sequencer to return the last resolve, use `sequencer.pipe()`:

```js
sequencer.pipe(

  () => new Promise(resolve => resolve(1)),

  () => new Promise(resolve => resolve(2))

)
.then(result => {
  console.log(result); // 2
})
```

# Signature

You can declare the stack of promises as an array or as a list:

```js
sequencer(promise1, promise2); // this is correct
sequencer([promise1, promise2]); // this is correct too
```

# Promisify

sequencer comes bundled with an utility that can run node callbacks as a promise:

```js
sequencer.promisify(fs.readdir, [__dirname]).then(/*...*/);

// Signature
promisify(Function functionWithCallback, [Mixed arguments]?, {Object functionBinder}?)
```
