export const middleware = <
  T extends (...args: any[]) => any,
  A extends (...args: Parameters<T>) => void | boolean,
>(
  fn: T,
  action: A,
): T => {
  return ((...args: Parameters<T>) => {
    if (action(...args) !== false) {
      return fn(...args)
    }
  }) as T
}
