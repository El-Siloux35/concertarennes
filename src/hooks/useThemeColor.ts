import { useEffect } from "react";

/**
 * Hook that sets the theme-color meta tag
 * Currently forces white to match the light theme
 * TODO: Update when dark mode is implemented
 */
export const useThemeColor = () => {
  useEffect(() => {
    const themeColor = "#ffffff"; // Force white until dark mode is implemented
    
    // Update all theme-color meta tags
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach((tag) => {
      tag.setAttribute("content", themeColor);
    });
  }, []);
};

export default useThemeColor;
