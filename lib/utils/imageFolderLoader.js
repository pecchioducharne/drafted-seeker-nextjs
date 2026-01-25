/**
 * Utility function to import all images from a specified folder
 * 
 * Usage:
 * 1. Import this function: import { loadImagesFromFolder } from '../utils/imageFolderLoader';
 * 2. Use in your component: const images = loadImagesFromFolder('/images/gallery');
 * 
 * @param {string} folderPath - Path to the folder relative to the public directory
 * @param {Array<string>} extensions - Array of file extensions to include (default: ['.jpg', '.jpeg', '.png', '.gif', '.webp'])
 * @param {number} limit - Maximum number of images to return (default: 0 for no limit)
 * @param {boolean} shuffle - Whether to shuffle the images (default: false)
 * @returns {Array<string>} Array of image paths
 */
export const loadImagesFromFolder = (
  folderPath, 
  extensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  limit = 0,
  shuffle = false
) => {
  // In a real environment, you'd dynamically load files from the directory
  // But in React, we need to handle this at build time or use server-side APIs
  
  try {
    // For demo purposes, we'll simulate loading images by returning paths
    // In a real app, you might use:
    // 1. An API endpoint that returns files from a directory
    // 2. Import.meta.glob in Vite
    // 3. require.context in webpack
    // 4. Or dynamically fetch a file listing from your backend
    
    // This is a placeholder that would be replaced with actual implementation
    // based on your project's build system and architecture
    const imagePaths = [];
    
    // In this demo, we'll just construct paths based on the folder
    // You'd replace this with actual file loading logic
    const getImagePathsFromFolder = () => {
      // Normally this would be dynamically generated
      return [
        `${folderPath}/image1.jpg`,
        `${folderPath}/image2.jpg`,
        `${folderPath}/image3.png`,
        `${folderPath}/image4.gif`,
        `${folderPath}/image5.webp`,
        `${folderPath}/image6.jpg`,
        `${folderPath}/image7.jpg`,
        `${folderPath}/image8.png`,
      ].filter(path => {
        const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
        return extensions.includes(ext);
      });
    };
    
    let images = getImagePathsFromFolder();
    
    // Shuffle if requested
    if (shuffle) {
      images = [...images].sort(() => Math.random() - 0.5);
    }
    
    // Limit if requested
    if (limit > 0 && images.length > limit) {
      images = images.slice(0, limit);
    }
    
    return images;
  } catch (error) {
    console.error('Error loading images from folder:', error);
    return [];
  }
};

/**
 * Load images using a glob pattern in build systems that support it
 * This is for more advanced use cases and will depend on your bundler
 * 
 * @param {string} folder - The folder to search in
 * @returns {Array<string>} Array of image URLs
 */
export const loadImagesWithGlob = (folder) => {
  // This implementation depends on your build system:
  
  // For Vite:
  // const images = import.meta.glob('/public/images/**/*.{png,jpg,jpeg,gif,webp}', { eager: true });
  // return Object.keys(images).map(path => path.replace('/public', ''));
  
  // For webpack, you would use require.context
  
  // Fallback to the basic implementation for demo
  return loadImagesFromFolder(folder);
}; 