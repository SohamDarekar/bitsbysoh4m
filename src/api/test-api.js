#!/usr/bin/env node

/**
 * API Test Tool
 * This script tests all endpoints of the newsletter API
 */

const API_URL = process.env.API_URL || 'http://localhost:4000';
const WEBSITE_URL = 'https://bitsbysoh4m.netlify.app';
const TEST_EMAIL = `test_${Date.now()}@example.com`;

console.log('⚡ API Test Tool');
console.log(`🔗 Testing API at ${API_URL}`);
console.log(`🌐 Testing for website: ${WEBSITE_URL}`);

// Simple fetch wrapper to make testing easier
async function fetchApi(endpoint, options = {}) {
  try {
    const url = `${API_URL}${endpoint}`;
    console.log(`🔍 Calling ${options.method || 'GET'} ${url}`);
    
    const response = await fetch(url, options);
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
    }
    
    return response;
  } catch (error) {
    console.error(`❌ Error fetching API: ${error.message}`);
    throw error;
  }
}

async function runTests() {
  try {
    // Test health endpoint
    console.log('\n🔍 Testing health endpoint...');
    const healthResponse = await fetchApi('/api/health');
    const healthData = await healthResponse.json();
    console.log(`✅ Health check result: ${JSON.stringify(healthData)}`);

    // Test subscription endpoint
    console.log('\n📨 Testing subscription endpoint...');
    console.log(`Using test email: ${TEST_EMAIL}`);
    const subscribeResponse = await fetchApi('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': WEBSITE_URL
      },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    const subscribeData = await subscribeResponse.json();
    console.log(`✅ Subscribe result: ${JSON.stringify(subscribeData)}`);
    
    // Try subscribing again to test existing email flow
    console.log('\n📨 Testing duplicate subscription...');
    const duplicateResponse = await fetchApi('/api/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer': WEBSITE_URL
      },
      body: JSON.stringify({ email: TEST_EMAIL })
    });
    
    const duplicateData = await duplicateResponse.json();
    console.log(`✅ Duplicate subscribe result: ${JSON.stringify(duplicateData)}`);
    
    // Test unsubscribe endpoint
    console.log('\n🚪 Testing unsubscribe endpoint...');
    const unsubscribeResponse = await fetchApi(`/api/unsubscribe?email=${TEST_EMAIL}`);
    const unsubscribeText = await unsubscribeResponse.text();
    console.log(`✅ Unsubscribe result: ${unsubscribeText}`);
    
    console.log('\n✅ All tests completed successfully!');
    
  } catch (error) {
    console.error(`❌ Test failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      console.error(`\n⚠️ Connection refused. Make sure your API is running at ${API_URL}`);
      console.error('Try running "npm run api" in another terminal before running tests.');
    }
    process.exit(1);
  }
}

runTests().finally(() => console.log('\nTests completed.'));
