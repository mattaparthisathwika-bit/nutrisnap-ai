import { useWindowDimensions } from "react-native";
import { breakpoints } from "../constants/theme";

export function useBreakpoint() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= breakpoints.desktop;
  const isTablet = width >= breakpoints.tablet && width < breakpoints.desktop;
  const isMobile = width < breakpoints.tablet;

  return { width, isDesktop, isTablet, isMobile };
}
