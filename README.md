## func-middleware

A customized middleware for your functions. performs an action before the main function

### Install

```bash
npm i func-middleware
```

### Example

**Pre-execution:**

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

**Execution blocking (return false):**

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

**Parameter interception:**

```js
import middleware from 'func-middleware'
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
