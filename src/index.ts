export const middleware = <
  T extends (...args: any[]) => any,
  A extends (
    ...args: Parameters<T>
  ) => Promise<boolean | void> | boolean | void,
>(
  func: T,
  action: A,
) => {
  return ((...args: Parameters<T>) => {
    const actionResult = action(...args)

    const handleBlockAction = (actionResult: boolean | void) => {
      if (actionResult !== false) {
        return func(...args)
      }
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
      const funcResult = actionResult.then(handleBlockAction)
      return handlePromiseFunc(funcResult)
    }

    const funcResult = handleBlockAction(actionResult)
    return handlePromiseFunc(funcResult)
  }) as ReturnType<A> extends Promise<any>
    ? (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>>
    : T
}
