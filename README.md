# Some tips for developer
## About multi-tenancy
- Each tenant has its own database, but shares the server.
- Hostnames are used to determine tenant of incoming requests.
- There is a global database that record the hostname.
    - so be careful for the scope of migrations and models
    - To migrate the global database: `npx sequelize-cli db:migrate --migrations-path migrations/global`
    - To create a test tenant: `node createTenant.js`
        - this is just a testing script, and default global database name is tenant_db
        - the created tenant has hostname `test_tenant.<domain-name>`