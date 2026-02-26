
import { validateIdNumber } from './idValidation';

const runTests = () => {
  const results = [];

  // AADHAAR Tests
  results.push({
    name: 'AADHAAR Valid',
    ...validateIdNumber('AADHAAR', '2345 6789 0123')
  });
  results.push({
    name: 'AADHAAR Invalid (Starts with 1)',
    ...validateIdNumber('AADHAAR', '1234 5678 9012')
  });
  results.push({
    name: 'AADHAAR Invalid (Length)',
    ...validateIdNumber('AADHAAR', '2345 6789 012')
  });

  // PAN Tests
  results.push({
    name: 'PAN Valid',
    ...validateIdNumber('PAN', 'ABCDE1234F')
  });
  results.push({
    name: 'PAN Invalid (Format)',
    ...validateIdNumber('PAN', 'ABCD12345F')
  });

  // PASSPORT Tests
  results.push({
    name: 'PASSPORT Valid',
    ...validateIdNumber('PASSPORT', 'A1234567')
  });
  results.push({
    name: 'PASSPORT Invalid (Format)',
    ...validateIdNumber('PASSPORT', '12345678')
  });

  // VISA Tests
  results.push({
    name: 'VISA Valid',
    ...validateIdNumber('VISA', 'V1234567890')
  });
  results.push({
    name: 'VISA Invalid (Too short)',
    ...validateIdNumber('VISA', 'V123')
  });

  // VOTER_ID Tests
  results.push({
    name: 'VOTER_ID Valid',
    ...validateIdNumber('VOTER_ID', 'ABC1234567')
  });
  results.push({
    name: 'VOTER_ID Invalid',
    ...validateIdNumber('VOTER_ID', 'AB12345678')
  });

  // DRIVING_LICENSE Tests
  results.push({
    name: 'DRIVING_LICENSE Valid',
    ...validateIdNumber('DRIVING_LICENSE', 'KA0120230001234')
  });
  results.push({
    name: 'DRIVING_LICENSE Invalid',
    ...validateIdNumber('DRIVING_LICENSE', '123456789012345')
  });

  return results;
};

const testResults = runTests();
console.log('--- ID Validation Test Results ---');
testResults.forEach(res => {
  console.log(`${res.isValid ? '✅' : '❌'} ${res.name}: ${res.isValid ? 'PASSED' : 'FAILED'} (${res.error || 'No error'})`);
});
