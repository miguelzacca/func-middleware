# func-middleware

A custom middleware and interceptor for your functions. performs an action before the main function or after.

## Install

```bash
npm i func-middleware
```

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

### Promise

The `action` can be a promise, in which case the return type of the main function will be changed to a promise.

## Interceptor

The interceptor allows you to modify or interact with the result of a function after it has been executed.

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
