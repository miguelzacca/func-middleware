type Func = (...args: any[]) => any

type MiddlewareAction<T extends Func> = (...args: Parameters<T>) => any

type InterceptorAction<T extends Func> = (
  result: Awaited<ReturnType<T>>,
  ...args: Parameters<T>
) => any

type PromiseComp<T extends Func> = (
  ...args: Parameters<T>
) => Promise<Awaited<ReturnType<T>>>

const processInterceptor = <T extends Func, A extends InterceptorAction<T>>(
  action: A,
  args: Parameters<T>,
  func: T,
) => {
  const handlePromiseFunc = (result: any) => {
    if (funcResult instanceof Promise) {
      return Promise.resolve(result)
    }
    return result
  }
  const funcResult = func(...args)
  const actionResult = action(funcResult, ...args)

  const result =
    actionResult instanceof Promise
      ? actionResult.then((res) => res ?? funcResult)
      : actionResult ?? funcResult

  return handlePromiseFunc(result)
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

  const handlePromiseResult = (result: any) => {
    if (func.constructor.name === 'AsyncFunction') {
      return Promise.resolve(result)
    }
    return result
  }

  const handleResultAction = (actionResult: ReturnType<M>) => {
    const isCompatibleArgs = (arr: any[]): arr is Parameters<T> => {
      return (
        arr.length === func.length &&
        arr.every((arg, i) => typeof arg === typeof args[i])
      )
    }

    const isArgs = Array.isArray(actionResult) && isCompatibleArgs(actionResult)
    const isFalse = actionResult === false

    if (!isFalse && (isArgs || !actionResult)) {
      const newArgs = isArgs ? actionResult : args

      return interceptorAction
        ? processInterceptor(interceptorAction, newArgs, func)
        : func(...newArgs)
    }

    return handlePromiseResult(isFalse ? undefined : actionResult)
  }

  if (actionResult instanceof Promise) {
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
