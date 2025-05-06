import { useEffect, useState } from "react";

export function useDecouncedValue(value: string, duration = 1000) {
  const [val, setVal] = useState(value);

  useEffect(() => {
    const timerId = setTimeout(() => setVal(value), duration);

    return () => clearTimeout(timerId);
  }, [value, duration]);

  return val;
}
