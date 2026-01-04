import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Hook that sets the theme-color meta tag based on current theme
 */
export const useThemeColor = () => {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    const themeColor = resolvedTheme === "dark" ? "#0d1117" : "#ffffff";
    
    // Update all theme-color meta tags
    const metaTags = document.querySelectorAll('meta[name="theme-color"]');
    metaTags.forEach((tag) => {
      tag.setAttribute("content", themeColor);
    });
  }, [resolvedTheme]);
};

export default useThemeColor;
