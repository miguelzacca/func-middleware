## func-middleware

A customized middleware for your functions. performs an action before the main function

### Install

```bash
npm i func-middleware
```

### Example

Pre-execution:

```js
import middleware from 'func-middleware'

const action = () => {
  console.log('Hello, world!')
}

const sum = middleware((num1, num2) => {
  return num1 + num2
}, action)

const result = sum(2, 2)
console.log(result)
```

Output:

```txt
Hello, wordl!
4
```

Execution blocking (return false):

```js
import middleware from 'func-middleware'

const action = () => {
  if (/** blocking conditional */) {
    return false
  }
}

const sum = middleware((num1, num2) => {
  return num1 + num2
}, action)

const result = sum(2, 2)
console.log(result)
```

Output:

```txt
undefined
```
