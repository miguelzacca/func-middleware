export const middleware = <T extends (...args: any[]) => any>(
  fn: T,
  action: () => void | boolean,
): T => {
  return ((...args) => {
    if (action() !== false) {
      return fn(...args)
    }
  }) as T
}
