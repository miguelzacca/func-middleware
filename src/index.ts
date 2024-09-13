export const middleware = <
  T extends (...args: any[]) => any,
  A extends (...args: Parameters<T>) => any,
>(
  func: T,
  action: A,
) => {
  return ((...args: Parameters<T>) => {
    const actionResult = action(...args)

    const handleResultAction = (actionResult: ReturnType<A>) => {
      const isParameters = (arr: any[]): arr is Parameters<T> => {
        return (
          arr.length === func.length &&
          arr.every((arg, i) => typeof arg === typeof args[i])
        )
      }

      const isArray = Array.isArray(actionResult)
      const isFalse = actionResult === false

      if (!isFalse && (isArray || !actionResult)) {
        const parameters =
          isArray && isParameters(actionResult) ? actionResult : args

        return func(...parameters)
      }

      return isFalse ? undefined : actionResult
    }

    const handlePromiseFunc = (
      funcResult: ReturnType<T> | Promise<ReturnType<T>>,
    ) => {
      if (Promise.resolve(funcResult) === funcResult) {
        return Promise.resolve(funcResult)
      }
      return funcResult
    }

    if (actionResult instanceof Promise) {
      const funcResult = actionResult.then(handleResultAction)
      return handlePromiseFunc(funcResult)
    }

    const funcResult = handleResultAction(actionResult)
    return handlePromiseFunc(funcResult)
  }) as ReturnType<A> extends Promise<any>
    ? (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>
    : T
}

export const interceptor = <
  T extends (...args: any[]) => any,
  A extends (result: Awaited<ReturnType<T>>, ...args: Parameters<T>) => any,
>(
  func: T,
  action: A,
) => {
  return ((...args: Parameters<T>) => {
    const funcResult = func(...args)

    const handlePromiseAction = (funcResult: Awaited<ReturnType<T>>) => {
      const actionResult = action(funcResult, ...args)
      if (actionResult instanceof Promise) {
        return Promise.resolve(actionResult) ?? funcResult
      }
      return actionResult ?? funcResult
    }

    if (funcResult instanceof Promise) {
      return funcResult.then(handlePromiseAction)
    }

    return handlePromiseAction(funcResult)
  }) as ReturnType<A> extends Promise<any>
    ? (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>
    : T
}
