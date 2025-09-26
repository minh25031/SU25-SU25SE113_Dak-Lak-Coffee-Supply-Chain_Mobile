// Component-specific constants
export const Components = {
  // Card dimensions
  card: {
    minHeight: 80,
    borderRadius: 20,
    padding: 20,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Stat card dimensions
  statCard: {
    minHeight: 120,
    borderRadius: 20,
    padding: 20,
    iconContainerSize: 50,
    iconSize: 28,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  // Avatar dimensions
  avatar: {
    sm: { width: 40, height: 40, borderRadius: 20 },
    md: { width: 60, height: 60, borderRadius: 30 },
    lg: { width: 80, height: 80, borderRadius: 40 },
  },
  
  // Icon container dimensions
  iconContainer: {
    sm: { width: 30, height: 30, borderRadius: 15 },
    md: { width: 40, height: 40, borderRadius: 20 },
    lg: { width: 50, height: 50, borderRadius: 25 },
  },
  
  // Menu item dimensions
  menuItem: {
    minHeight: 80,
    borderRadius: 20,
    padding: 20,
    iconSize: 28,
    iconContainerSize: 50,
  },
  
  // Activity item dimensions
  activityItem: {
    borderRadius: 12,
    padding: 16,
    iconSize: 20,
    iconContainerSize: 40,
  },
  
  // Header dimensions
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 24,
    borderRadius: 30,
  },
  
  // Section dimensions
  section: {
    paddingHorizontal: 24,
    marginBottom: 30,
  },
} as const;

