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
      
      // Reemplazar , error: error.message
      content = content.replace(/,\s*error:\s*error\.message/g, ', ...(process.env.NODE_ENV === "development" && { error: error.message })');
      
      // Reemplazar error: error.message (cuando está en una nueva línea solo)
      content = content.replace(/(?<!,\s*)error:\s*error\.message(,?)/g, '...(process.env.NODE_ENV === "development" && { error: error.message })$1');
      
      fs.writeFileSync(fullPath, content);
    }
  }
}

processDir(controllersDir);
console.log('Done');
