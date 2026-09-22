import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export default function useTabNavigation(defaultTab = "overview", options = {}) {
  const { onBackAtRoot } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  const tab = searchParams.get("view") || defaultTab;

  const tabRef = useRef(tab);
  tabRef.current = tab;

  function goTab(next) {
    if (next === tabRef.current) return;
    const params = new URLSearchParams(location.search);
    params.set("view", next);
    setSearchParams(params, { replace: false });
  }

  function tabBack() {
    if (tabRef.current === defaultTab) return false;
    skipPopRef.current = true;
    navigate(-1);
    return true;
  }

  useEffect(() => {
    function onPop() {
      if (skipPopRef.current) {
        skipPopRef.current = false;
        return;
      }
      if (tabRef.current === defaultTab) onBackAtRoot?.();
    }
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [onBackAtRoot, defaultTab]);

  return { tab, goTab, tabBack };
}
