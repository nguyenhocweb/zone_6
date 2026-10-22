import imageSize from 'image-size';
import fs from 'node:fs';
import path from 'node:path';

async function test() {
  console.log('Testing image metadata extraction with image-size...');
  
  // Tạo 1 file ảnh nhỏ hoặc test
  const tempFile = path.join(process.cwd(), 'scratch', 'test.jpg');
  if (fs.existsSync(tempFile)) {
    const buf = fs.readFileSync(tempFile);
    const dim = imageSize(buf);
    console.log('Dimensions:', dim);
  } else {
    console.log('Test file not found, but image-size is available:', typeof imageSize);
  }
}

test();
