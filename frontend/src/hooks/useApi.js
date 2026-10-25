import { useEffect, useState } from "react";

export default function useApi(path) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    fetch(path, { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`${res.status} ${res.statusText}`))))
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => err.name !== "AbortError" && setState({ data: null, loading: false, error: err.message }));
    return () => controller.abort();
  }, [path]);

  return state;
}
