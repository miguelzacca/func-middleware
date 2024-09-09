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

    function handleBlockAction(result: boolean | void) {
      if (result !== false) {
        return func(...args)
      }
    }

    if (actionResult instanceof Promise) {
      return actionResult.then((res) => handleBlockAction(res))
    }

    return handleBlockAction(actionResult)
  }) as ReturnType<A> extends Promise<any>
    ? (...args: Parameters<T>) => Promise<ReturnType<T>>
    : T
}
