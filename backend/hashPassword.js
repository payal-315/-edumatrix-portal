const bcrypt = require('bcrypt');

async function createHash() {
  const hash = await bcrypt.hash('payal123', 10);
  console.log(hash);
}

createHash();
