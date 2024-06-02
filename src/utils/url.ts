import { useCallback } from "react";

export const useUrlState = (key: string, defaultValue: string) => {
  const queryParams = getCurrentQueryParams();
  console.log("query params", queryParams);
  const state = queryParams.get(key) ?? defaultValue;

  const deleteQueryParam = useCallback(() => {
    const newParams = getCurrentQueryParams();
    newParams.delete(key);
    window.location.search = newParams.toString();
  }, [key]);

  const setQueryParam = useCallback(
    (newValue: string) => {
      const newParams = getCurrentQueryParams();
      if (newValue === defaultValue) {
        deleteQueryParam();
        return;
      }
      newParams.set(key, newValue);
      window.location.search = newParams.toString();
    },
    [key, defaultValue, deleteQueryParam],
  );

  return { queryParam: state, setQueryParam };
};

const getCurrentQueryParams = () => {
  return new URLSearchParams(window.location.search);
};
