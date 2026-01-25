/**
 * Utility function to make Lottie animations white
 * Recursively updates all color properties in a Lottie JSON to white
 */

export const makeLottieWhite = (lottieData) => {
  if (!lottieData || typeof lottieData !== 'object') {
    return lottieData;
  }

  const whiteColor = [1, 1, 1, 1]; // RGBA white
  const whiteColorRGB = [1, 1, 1]; // RGB white

  const processObject = (obj) => {
    if (Array.isArray(obj)) {
      return obj.map(item => processObject(item));
    }

    if (obj && typeof obj === 'object') {
      const processed = { ...obj };

      // Check if this is a color property
      if (obj.c && Array.isArray(obj.c) && obj.c.length >= 3) {
        // This is a color property - make it white
        if (obj.c.length === 4) {
          processed.c = { ...obj.c, k: whiteColor };
        } else {
          processed.c = { ...obj.c, k: whiteColorRGB };
        }
      }

      // Recursively process all properties
      for (const key in processed) {
        if (processed[key] && typeof processed[key] === 'object') {
          processed[key] = processObject(processed[key]);
        }
      }

      return processed;
    }

    return obj;
  };

  return processObject(lottieData);
};

/**
 * Alternative approach: CSS filter to make Lottie white
 * This can be applied as a CSS class to the Lottie container
 */
export const lottieWhiteFilter = `
  filter: brightness(0) invert(1);
`;

/**
 * CSS class for making Lottie animations white
 */
export const lottieWhiteClass = `
  .lottie-white {
    filter: brightness(0) invert(1);
  }
  
  .lottie-white svg {
    filter: brightness(0) invert(1);
  }
`; 