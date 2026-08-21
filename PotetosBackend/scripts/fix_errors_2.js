const fs = require('fs');
const path = require('path');
const controllersDir = path.join('c:/Users/Usuario/Documents/PotetosApp/PotetosBackend/src/controllers');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // Fix the double injection
      content = content.replace(/\.\.\.\(process\.env\.NODE_ENV === "development" && { \.\.\.\(process\.env\.NODE_ENV === "development" && { error: error\.message }\) }\)/g, '...(process.env.NODE_ENV === "development" && { error: error.message })');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(controllersDir);
console.log('Fixed');
