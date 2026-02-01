import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

/**
 * Custom navigation hook that adds iOS-like slide transitions
 */
export function useNavigation() {
  const navigate = useNavigate();

  const goBack = useCallback(() => {
    // Use View Transitions API if available for smooth iOS-like animation
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(-1);
      });
    } else {
      navigate(-1);
    }
  }, [navigate]);

  const goTo = useCallback((path: string, options?: { replace?: boolean }) => {
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        navigate(path, options);
      });
    } else {
      navigate(path, options);
    }
  }, [navigate]);

  return { goBack, goTo, navigate };
}
