# How to Set Up Jest Testing in FinFriend

## Step 1: Install Jest and Supertest

Open your terminal in the FinFriend project folder and run:

```bash
npm install --save-dev jest supertest
```

This adds two things:
- **jest** - the test runner (runs your test files)
- **supertest** - lets us send fake HTTP requests without starting the server

The project structure should now look like:
```
finfriend/
  db/
  middleware/
  METRICS/
  public/
  routes/
  tests/           ← ADDED this FOLDER
    setup.js       ← NEW FILE
    tools.test.js  ← NEW FILE
    auth.test.js   ← NEW FILE
  server.js
  package.json
```


## Step 4: Run the tests

```bash
npm test
```

The output should look like this:

```
PASS tests/tools.test.js
  Budget Calculator - POST /api/tools/budget
    ✓ TC-B01: should return 200 and correct breakdown for valid income
    ✓ TC-B02: should use custom percentages when all three are provided
    ✓ TC-B03: should return 400 when income is missing from the request
    ✓ TC-B04: should return 400 when income is zero (boundary condition)
    ✓ TC-B05: should return 400 when income is negative

  Investment Calculator - POST /api/tools/investment
    ✓ TC-I01: should return 200 and a future value that is greater than principal
    ✓ TC-I02: should produce a higher future value when monthly contributions are added
    ✓ TC-I03: should return 400 when principal is missing
    ✓ TC-I04: should return 400 when annual_rate is missing
    ✓ TC-I05: should return 400 when years is missing

  Loan Calculator - POST /api/tools/loan
    ✓ TC-L01: should return 200 and a monthly payment greater than zero
    ✓ TC-L02: should calculate zero interest correctly (boundary condition)
    ✓ TC-L03: should return 400 when principal is missing
    ✓ TC-L04: should return 400 when annual_rate is missing
    ✓ TC-L05: should return 400 when months is missing

PASS tests/auth.test.js
  Register Route - Input Validation (POST /api/auth/register)
    ✓ TC-R01: should return 400 when full_name is not provided
    ✓ TC-R02: should return 400 when email is not provided
    ✓ TC-R03: should return 400 when password is not provided
    ✓ TC-R04: should return 400 when all fields are missing (empty body)

  Login Route - Input Validation (POST /api/auth/login)
    ✓ TC-L01: should return 400 when email is not provided
    ✓ TC-L02: should return 400 when password is not provided
    ✓ TC-L03: should return 400 when both fields are missing

Tests: 22 passed, 22 total
```
