import { useCallback, useState } from "react";

export function usePWAUpdate() {
  const [needRefresh] = useState(false);
  const [checking, setChecking] = useState(false);

  const checkForUpdate = useCallback(async (): Promise<boolean> => {
    setChecking(true);
    try {
      return false;
    } finally {
      setChecking(false);
    }
  }, []);

  const applyUpdate = useCallback(async () => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("_v", Date.now().toString());
      window.location.replace(url.toString());
    }
  }, []);

  return { needRefresh, checking, checkForUpdate, applyUpdate };
}
