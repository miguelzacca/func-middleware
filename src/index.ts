type Func = (...args: any[]) => any

type MiddlewareAction<T extends Func> = (...args: Parameters<T>) => any

type InterceptorAction<T extends Func> = (
  result: Awaited<ReturnType<T>>,
  ...args: Parameters<T>
) => any

type PromiseComp<T extends Func> = (
  ...args: Parameters<T>
) => Promise<Awaited<ReturnType<T>>>

const handlePromiseFunc = <T extends Func>(
  funcResult: ReturnType<T>,
): Promise<ReturnType<T>> | ReturnType<T> => {
  if (funcResult.then) {
    return Promise.resolve(funcResult)
  }
  return funcResult
}

const processInterceptor = <T extends Func, A extends InterceptorAction<T>>(
  action: A,
  args: Parameters<T>,
  func: T,
) => {
  const funcResult = func(...args)
  const actionResult = action(funcResult, ...args)
  if (actionResult instanceof Promise) {
    return Promise.resolve(actionResult).then((res) => res ?? funcResult)
  }
  return actionResult ?? funcResult
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

    return isFalse ? undefined : actionResult
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
    const funcResult = processAction(action, args, func)
    return handlePromiseFunc(funcResult)
  }) as ReturnType<A> extends Promise<any> ? PromiseComp<T> : T
}

export const interceptor = <T extends Func, A extends InterceptorAction<T>>(
  func: T,
  action: A,
) => {
  return ((...args: Parameters<T>) => {
    const funcResult = processInterceptor(action, args, func)
    return handlePromiseFunc(funcResult)
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
    const funcResult = processAction(
      middlewareAction,
      args,
      func,
      interceptorAction,
    )
    return handlePromiseFunc(funcResult)
  }) as ReturnType<M> extends Promise<any>
    ? PromiseComp<T>
    : ReturnType<I> extends Promise<any>
    ? PromiseComp<T>
    : T
}
