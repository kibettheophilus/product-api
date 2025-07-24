// debug-jwt.js
// Debug script to test JWT token generation and validation

const jwt = require('jsonwebtoken');
const baseUrl = 'http://localhost:3000';

// JWT Secret (should match your .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

async function debugJWT() {
  console.log('🔍 JWT Debug Script\n');

  try {
    // Step 1: Register a user and get a token
    console.log('1️⃣ Registering a new user...');

    const registerResponse = await fetch(`${baseUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: `debug.${Date.now()}@example.com`,
        password: 'DebugPass123!',
        firstName: 'Debug',
        lastName: 'User'
      })
    });

    if (!registerResponse.ok) {
      const error = await registerResponse.json();
      console.log('❌ Registration failed:', error);
      return;
    }

    const registerData = await registerResponse.json();
    const token = registerData.access_token;

    console.log('✅ Registration successful');
    console.log(`   Token: ${token.substring(0, 50)}...`);
    console.log(`   Full Token Length: ${token.length}`);

    // Step 2: Decode the token to see its contents
    console.log('\n2️⃣ Decoding JWT token...');

    try {
      const decoded = jwt.decode(token, { complete: true });
      console.log('✅ Token decoded successfully');
      console.log('   Header:', JSON.stringify(decoded.header, null, 2));
      console.log('   Payload:', JSON.stringify(decoded.payload, null, 2));

      // Verify the token signature
      const verified = jwt.verify(token, JWT_SECRET);
      console.log('✅ Token signature verified');
      console.log('   Verified Payload:', JSON.stringify(verified, null, 2));

    } catch (decodeError) {
      console.log('❌ Token decode/verify failed:', decodeError.message);
      console.log('   JWT_SECRET being used:', JWT_SECRET);
    }

    // Step 3: Test the token with the API
    console.log('\n3️⃣ Testing token with protected endpoint...');

    const profileResponse = await fetch(`${baseUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log(`   Response Status: ${profileResponse.status}`);

    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Token accepted by API');
      console.log('   User:', profileData.user.email);
    } else {
      const error = await profileResponse.json();
      console.log('❌ Token rejected by API');
      console.log('   Error:', error);

      // Additional debugging info
      console.log('\n🔍 Debug Information:');
      console.log('   Request Headers:');
      console.log(`     Authorization: Bearer ${token.substring(0, 20)}...`);
      console.log('   Response Headers:', Object.fromEntries(profileResponse.headers.entries()));
    }

    // Step 4: Test with manually created token
    console.log('\n4️⃣ Testing with manually created token...');

    const manualPayload = {
      sub: registerData.user.id,
      email: registerData.user.email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    };

    const manualToken = jwt.sign(manualPayload, JWT_SECRET);
    console.log(`   Manual Token: ${manualToken.substring(0, 50)}...`);

    const manualTestResponse = await fetch(`${baseUrl}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${manualToken}`,
      }
    });

    console.log(`   Manual Token Status: ${manualTestResponse.status}`);

    if (manualTestResponse.ok) {
      console.log('✅ Manual token works');
    } else {
      const manualError = await manualTestResponse.json();
      console.log('❌ Manual token failed:', manualError);
    }

    // Step 5: Test environment variables
    console.log('\n5️⃣ Environment Variables Check...');
    console.log(`   JWT_SECRET length: ${JWT_SECRET.length}`);
    console.log(`   JWT_SECRET: ${JWT_SECRET.substring(0, 20)}...`);
    console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
    console.log(`   JWT_EXPIRES_IN: ${process.env.JWT_EXPIRES_IN || 'undefined'}`);

    // Step 6: Test different token formats
    console.log('\n6️⃣ Testing token format variations...');

    const variations = [
      { name: 'Original Token', token: token },
      { name: 'Token with extra spaces', token: ` ${token} ` },
      { name: 'Token without Bearer prefix', token: token, skipBearer: true },
    ];

    for (const variation of variations) {
      const headers = variation.skipBearer
        ? { 'Authorization': variation.token }
        : { 'Authorization': `Bearer ${variation.token.trim()}` };

      const testResponse = await fetch(`${baseUrl}/auth/profile`, {
        method: 'GET',
        headers
      });

      console.log(`   ${variation.name}: ${testResponse.status}`);
    }

    console.log('\n🎯 Debug Summary:');
    console.log('   - Check if JWT_SECRET matches between token generation and validation');
    console.log('   - Verify token format and Bearer prefix');
    console.log('   - Ensure user exists and is active in database');
    console.log('   - Check server logs for detailed error messages');

  } catch (error) {
    console.error('❌ Debug script failed:', error.message);
    console.log('\n🔧 Make sure:');
    console.log('   1. Server is running on http://localhost:3000');
    console.log('   2. Database is connected');
    console.log('   3. JWT_SECRET environment variable is set');
  }
}

// Helper function to test JWT basics
function testJWTBasics() {
  console.log('\n🧪 JWT Basics Test:');

  const testPayload = { test: 'data', iat: Math.floor(Date.now() / 1000) };
  const testToken = jwt.sign(testPayload, JWT_SECRET);

  console.log(`   Generated Token: ${testToken.substring(0, 50)}...`);

  try {
    const verified = jwt.verify(testToken, JWT_SECRET);
    console.log('   ✅ Basic JWT sign/verify works');
    console.log('   Verified:', verified);
  } catch (error) {
    console.log('   ❌ Basic JWT sign/verify failed:', error.message);
  }
}

if (require.main === module) {
  // Test JWT basics first
  testJWTBasics();

  // Then run the full debug
  debugJWT().catch(console.error);
}

module.exports = { debugJWT, testJWTBasics };
