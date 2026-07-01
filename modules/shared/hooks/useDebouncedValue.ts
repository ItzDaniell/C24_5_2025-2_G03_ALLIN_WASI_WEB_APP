import React from "react";

export default function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = React.useState<T>(value);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  return debounced;
}


