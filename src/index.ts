type Func = (...args: any[]) => any

type MiddlewareAction<T extends Func> = (...args: Parameters<T>) => any

type InterceptorAction<T extends Func> = (
  result: Awaited<ReturnType<T>>,
  ...args: Parameters<T>
) => any

type PromiseComp<T extends Func> = (
  ...args: Parameters<T>
) => Promise<Awaited<ReturnType<T>>>

const isAsyncFunction = <T extends Func>(func: T) => {
  return func.constructor.name === 'AsyncFunction'
}

const isPromiseInstance = <T>(value: T) => value instanceof Promise

const handlePromise = <T>(result: T, isAsync: boolean) => {
  return isAsync ? Promise.resolve(result) : result
}

const processInterceptor = <T extends Func, A extends InterceptorAction<T>>(
  action: A,
  args: Parameters<T>,
  func: T,
) => {
  const funcResult = func(...args)
  const actionResult = action(funcResult, ...args)

  const decideResult = <T>(actionResult: T) => actionResult ?? funcResult

  const result = isPromiseInstance(actionResult)
    ? actionResult.then(decideResult)
    : decideResult(actionResult)

  return handlePromise(result, isPromiseInstance(funcResult))
}

const processAction = <
  T extends Func,
  M extends MiddlewareAction<T>,
  I extends InterceptorAction<T>,
>(
  middlewareAction: M,
  args: Parameters<T>,
  func: T,
  interceptorAction?: I,
) => {
  const actionResult = middlewareAction(...args)

  const handleResultAction = (actionResult: ReturnType<M>) => {
    const isCompatibleArgs = (array: any[]): array is Parameters<T> => {
      return (
        array.length === func.length &&
        array.every((arg, i) => typeof arg === typeof args[i])
      )
    }

    const isArgs = Array.isArray(actionResult) && isCompatibleArgs(actionResult)
    const isFalse = actionResult === false

    if (!isFalse && (isArgs || !actionResult)) {
      const newArgs = isArgs ? actionResult : args

      if (interceptorAction) {
        return processInterceptor(interceptorAction, newArgs, func)
      }
      return func(...newArgs)
    }

    const result = isFalse ? undefined : actionResult
    return handlePromise(result, isAsyncFunction(func))
  }

  if (isPromiseInstance(actionResult)) {
    return actionResult.then(handleResultAction)
  }
  return handleResultAction(actionResult)
}

export const middleware = <T extends Func, A extends MiddlewareAction<T>>(
  func: T,
  action: A,
) => {
  return ((...args: Parameters<T>) => {
    return processAction(action, args, func)
  }) as ReturnType<A> extends Promise<any> ? PromiseComp<T> : T
}

export const interceptor = <T extends Func, A extends InterceptorAction<T>>(
  func: T,
  action: A,
) => {
  return ((...args: Parameters<T>) => {
    return processInterceptor(action, args, func)
  }) as ReturnType<A> extends Promise<any> ? PromiseComp<T> : T
}

export const capsule = <
  T extends Func,
  M extends MiddlewareAction<T>,
  I extends InterceptorAction<T>,
>(
  func: T,
  [middlewareAction, interceptorAction]: [M, I],
) => {
  return ((...args: Parameters<T>) => {
    return processAction(middlewareAction, args, func, interceptorAction)
  }) as ReturnType<M> extends Promise<any>
    ? PromiseComp<T>
    : ReturnType<I> extends Promise<any>
    ? PromiseComp<T>
    : T
}
