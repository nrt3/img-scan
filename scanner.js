const fs = require('fs');
const http = require('http');

const url = 'http://www.ocrwebservice.com/restservices/processDocument?gettext=true';

module.exports = (key, userName, filePath, language) => {
  const request = new Promise((resolve, reject) => {
    const file = fs.readFileSync(filePath);
    const options = {
      hostname: 'www.ocrwebservice.com',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${userName}:${key}`).toString('base64')}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(file),
      },
      path: `/restservices/processDocument?gettext=true&language=${language}`,
      method: 'POST',
    };
    const data = [];
    const request = http.request(options, res => {
      if (res.statusCode >= 400)  {
        reject({ statusCode: res.statusCode });
      } 
      res.on('data', (chunk) => {
        data.push(chunk);
      });
      res.on('end', () => {
        const { OCRText, AvailablePages} = JSON.parse(data.join(''));
        resolve({
          text: OCRText,
          availablePages: AvailablePages,
        });
      });
    });
    request.on('error', (e) => {
      reject(e);
    });
    request.write(file);
    request.end();
  });
  return request;
};
