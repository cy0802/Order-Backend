const { createTenant } = require('./tests/util');

createTenant()
  .then(() => {
    console.log('Tenant created successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error creating tenant:', error);
    process.exit(1);
  });