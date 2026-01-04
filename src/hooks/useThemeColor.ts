import { useEffect } from "react";

/**
 * Hook that dynamically updates the theme-color meta tag
 * based on the system color scheme preference
 */
export const useThemeColor = () => {
  useEffect(() => {
    const updateThemeColor = () => {
      const isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const themeColor = isDark ? "#000000" : "#ffffff";
      
      // Update all theme-color meta tags
      const metaTags = document.querySelectorAll('meta[name="theme-color"]');
      metaTags.forEach((tag) => {
        tag.setAttribute("content", themeColor);
      });
      
      // Also update the manifest theme color dynamically if possible
      const manifestLink = document.querySelector('link[rel="manifest"]');
      if (manifestLink) {
        // Force refresh manifest (some browsers cache it)
        const href = manifestLink.getAttribute("href");
        if (href) {
          manifestLink.setAttribute("href", href + "?v=" + Date.now());
        }
      }
    };

    // Initial update
    updateThemeColor();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateThemeColor);

    return () => {
      mediaQuery.removeEventListener("change", updateThemeColor);
    };
  }, []);
};

export default useThemeColor;
