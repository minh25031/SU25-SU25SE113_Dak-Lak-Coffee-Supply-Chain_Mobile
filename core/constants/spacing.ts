// Spacing constants for consistent layout
export const Spacing = {
  // Base spacing unit (8px)
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 16,   // 16px
  lg: 24,   // 24px
  xl: 32,   // 32px
  xxl: 40,  // 40px
  xxxl: 48, // 48px
  
  // Specific spacing
  headerPadding: 24,
  cardPadding: 20,
  sectionMargin: 30,
  itemGap: 12,
  
  // Border radius
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    round: 50,
  },
  
  // Icon sizes
  icon: {
    xs: 12,
    sm: 16,
    md: 20,
    lg: 24,
    xl: 28,
    xxl: 32,
  },
  
  // Button sizes
  button: {
    sm: { width: 48, height: 48, borderRadius: 24 },
    md: { width: 56, height: 56, borderRadius: 28 },
    lg: { width: 64, height: 64, borderRadius: 32 },
  },
  
  // Shadow offsets
  shadow: {
    sm: { width: 0, height: 1 },
    md: { width: 0, height: 2 },
    lg: { width: 0, height: 4 },
    xl: { width: 0, height: 8 },
  },
} as const;

