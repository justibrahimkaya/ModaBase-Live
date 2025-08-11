const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

// Image optimization script
async function optimizeImages(directory) {
  const files = await fs.readdir(directory);
  
  for (const file of files) {
    const filePath = path.join(directory, file);
    const stat = await fs.stat(filePath);
    
    if (stat.isDirectory()) {
      await optimizeImages(filePath);
    } else if (/\.(jpg|jpeg|png)$/i.test(file)) {
      console.log(`Optimizing ${filePath}...`);
      
      try {
        const image = sharp(filePath);
        const metadata = await image.metadata();
        
        // Skip if already optimized
        if (metadata.width <= 1920) {
          await image
            .resize(metadata.width, metadata.height, {
              fit: 'inside',
              withoutEnlargement: true
            })
            .jpeg({ quality: 85, progressive: true })
            .toFile(filePath + '.optimized');
            
          // Replace original with optimized
          await fs.rename(filePath + '.optimized', filePath);
          console.log(`✓ Optimized ${file}`);
        }
      } catch (error) {
        console.error(`Failed to optimize ${file}:`, error.message);
      }
    }
  }
}

// Run optimization
if (require.main === module) {
  optimizeImages('./public').catch(console.error);
}