# func-middleware

A custom middleware and interceptor for your functions. performs an action before the main function or after.

## Install

```bash
npm i func-middleware
```

## API

#### - `middleware(func, action)`

#### - `interceptor(func, action)`

#### - `capsule(func, [middlewareAction, interceptorAction])`

### Example

**Pre-execution:**

```js
import { middleware } from 'func-middleware'

const action = () => {
  console.log('Hello, world!')
}

const sum = middleware((num1: number, num2: number) => {
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

**Execution blocking (return false or block result):**

```js
import { middleware } from 'func-middleware'

const action = () => {
  if (/** blocking conditional */) {
    return false // false or any other value
  }
}

const sum = middleware((num1: number, num2: number) => {
  return num1 + num2
}, action)

const result = sum(2, 2)
console.log(result)
```

Output:

```txt
undefined
```

**Parameter interception:**

```js
import { middleware } from 'func-middleware'
import { User } from './userEntity.ts'

const createUserDTO = (data: User) => {
  if (data.age < 18) {
    throw new Error('Users must be over 18 years old')
  }
}

const createUser = middleware((data: User) => {
  return new User(data)
}, createUserDTO)

const johnDoe = createUser({ uname: 'John Doe', age: 17 }) // Error: Users must be over 18 years old

const jones = createUser({ uname: 'jones', age: 21 }) // Success
console.log(jones)
```

Output:

```txt
User { uname: 'jones', age: 21 }
```

**Parameter validation: (return the new parameter array)**

Obs: The new parameter array must be compatible with the function parameters, so if there are two parameters you must return both parameters in the array, even if not modified.

```js
import { middleware } from 'func-middleware'

const toLowerCase = (name1: string, name2: string) => {
  return [name1.toLowerCase(), name2]
}

const printNames = middleware((name1: string, name2: string) => {
  console.log(name1)
  console.log(name2)
}, toLowerCase)

printNames('JOHN', 'JONES')
```

Output:

```txt
john
JONES
```

### Promise

The `action` can be a promise, in which case the return type of the main function will be changed to a promise.

## Interceptor

The interceptor allows you to modify or interact with the result of a function after it has been executed. Receiving as parameters the result of the function and its parameters.

### Example

**Case 1:**

```js
import { interceptor } from 'func-middleware'

const action = (result: number) => {
  return result * 2
}

const sum = interceptor((num1: number, num2: number) => {
  return num1 + num2
}, action)

const result = sum(10, 10)
console.log(result)
```

Output:

```txt
40
```

**Case 2:**

```js
import { interceptor } from 'func-middleware'

const action = (result: number) => {
  if (result > 10) {
    throw new Error('Result should be lt 10')
  }
}

const sum = interceptor((num1: number, num2: number) => {
  return num1 + num2
}, action)

const result = sum(10, 10) // Error: Result should be lt 10
console.log(result)
```

**Case 3:**

```js
import { interceptor } from 'func-middleware'

const test = (result: number, num1: number, num2: number) => {
  if (result - (num1 + num2) === 0) {
    console.log('Success')
  }
  console.log('Error')
}

const sum = interceptor((num1: number, num2: number) => {
  return num1 + num2
}, test)

const result = sum(10, 10)
console.log(result)
```

Output:

```txt
Success
20
```

## Capsule

The capsule is the combination of middleware and interceptor.

### Example

**Case 1:**

```js
import { capsule } from 'func-middleware'

const sum = (num1: number, num2: number) => {
  return num1 + num2
}

const sumCapsule = capsule(sum, [
  (num1, num2) => {
    // Middleware action
    console.log(num1, num2)
  },
  (res, num1, num2) => {
    // Interceptor action
    console.log(res, num1, num2)
  },
])

sumCapule(2, 2)
```

Output:

```txt
2 2
4 2 2
```
