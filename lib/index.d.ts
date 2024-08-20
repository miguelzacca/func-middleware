export declare const middleware: <T extends (...args: any[]) => any>(fn: T, action: () => void | boolean) => T;
