require('dotenv').config({ path: '.env.local' });
console.log('ADMIN_PASSWORD_HASH from dotenv:');
console.log('Value:', process.env.ADMIN_PASSWORD_HASH);
console.log('Length:', process.env.ADMIN_PASSWORD_HASH?.length);
