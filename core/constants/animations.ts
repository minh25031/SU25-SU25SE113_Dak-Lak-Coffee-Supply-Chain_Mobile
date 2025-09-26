// Animation constants for consistent timing and easing
export const Animations = {
  // Duration (in milliseconds)
  duration: {
    fast: 200,
    normal: 300,
    slow: 500,
    slower: 800,
    slowest: 1000,
  },
  
  // Easing functions
  easing: {
    linear: 'linear' as const,
    ease: 'ease' as const,
    easeIn: 'ease-in' as const,
    easeOut: 'ease-out' as const,
    easeInOut: 'ease-in-out' as const,
  },
  
  // Common animation configurations
  configs: {
    fadeIn: {
      duration: 1000,
      useNativeDriver: true,
    },
    slideUp: {
      duration: 800,
      useNativeDriver: true,
    },
    scale: {
      duration: 600,
      useNativeDriver: true,
    },
    bounce: {
      duration: 500,
      useNativeDriver: true,
    },
  },
  
  // Animation values
  values: {
    fade: {
      from: 0,
      to: 1,
    },
    slide: {
      from: 50,
      to: 0,
    },
    scale: {
      from: 0.9,
      to: 1,
    },
  },
} as const;

