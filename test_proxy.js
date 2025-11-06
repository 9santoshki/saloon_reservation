// Simple test to verify the proxy works
const axios = require('axios');

console.log('Testing direct connection to Python AI agent...');
axios.post('http://localhost:5001/api/ai/chat', {
  message: 'Test from direct connection',
  history: []
}, {
  timeout: 10000
})
.then(response => {
  console.log('Direct connection to Python AI agent: SUCCESS');
  console.log('Response preview:', JSON.stringify(response.data).substring(0, 200) + '...');
})
.catch(err => {
  console.error('Direct connection to Python AI agent: FAILED', err.message);
});

console.log('\nTesting main server proxy...');
axios.post('http://localhost:3001/api/ai/chat', {
  message: 'Test from proxy connection',
  history: []
}, {
  timeout: 10000
})
.then(response => {
  console.log('Main server proxy: SUCCESS');
  console.log('Response preview:', JSON.stringify(response.data).substring(0, 200) + '...');
})
.catch(err => {
  console.error('Main server proxy: FAILED', err.message);
});