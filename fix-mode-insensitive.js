const fs = require('fs');
const path = require('path');

const files = [
  'app/erkek-triko/page.tsx',
  'app/products/page.tsx',
  'app/api/products/route.ts',
  'app/yazlik-elbise/page.tsx',
  'app/triko-elbise/page.tsx',
  'app/kadin-tisort/page.tsx',
  'app/kadin-pantolon/page.tsx',
  'app/buyuk-beden/page.tsx',
  'app/bluz-modelleri/page.tsx',
  'app/siyah-elbise/page.tsx',
  'app/kadin-elbise/page.tsx',
  'app/triko/page.tsx',
  'app/api/admin/products/route.ts'
];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove , mode: 'insensitive'
    content = content.replace(/, mode: 'insensitive'/g, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${file}`);
  }
});

console.log('\n✅ All mode: insensitive removed!');
