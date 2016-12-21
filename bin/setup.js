const fs = require('fs');

fs.createReadStream('.default-env')
  .pipe(fs.createWriteStream('.env'));
