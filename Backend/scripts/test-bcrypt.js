// bcrypt-test.js
const bcrypt = require('bcrypt');

async function testBcrypt() {
  try {
    const plainPassword = 'password123';

    // Step 1: Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('Hashed password:', hashedPassword);

    // Step 2: Simulate storing hashed password in "DB"
    const fakeUserFromDb = {
      email: 'test@example.com',
      password: hashedPassword,
    };

    // Step 3: Simulate login attempt with correct password
    const loginPassword = 'password123';
    const isMatch = await bcrypt.compare(loginPassword, fakeUserFromDb.password);
    console.log('Login with correct password:', isMatch); // should print: true

    // Step 4: Simulate login attempt with wrong password
    const wrongPassword = 'wrongpassword';
    const isMatchWrong = await bcrypt.compare(wrongPassword, fakeUserFromDb.password);
    console.log('Login with wrong password:', isMatchWrong); // should print: false
  } catch (error) {
    console.error('Error in bcrypt test:', error);
  }
}

testBcrypt();
