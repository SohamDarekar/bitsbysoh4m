const bcrypt = require('bcryptjs');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node hashPassword.js <your-password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nYour password hash is:');
console.log(hash);
console.log('\nCopy this hash and paste it as ADMIN_PASSWORD_HASH in your .env.local file\n');
