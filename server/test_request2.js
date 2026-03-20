const http = require('http');
const fs = require('fs');
http.get('http://localhost:5000/api/ai/company-prep?company=Flipkart', (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => { 
    fs.writeFileSync('error_output.json', data);
    console.log("Wrote to error_output.json");
  });
});
