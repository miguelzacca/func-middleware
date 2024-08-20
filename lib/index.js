export const middleware = (fn, action) => {
    return ((...args) => {
        if (action() !== false) {
            return fn(...args);
        }
    });
};
