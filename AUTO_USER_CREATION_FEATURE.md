# Auto User Creation Feature - Implementation Guide

## Overview
This feature automatically creates a user account whenever an HR administrator creates a new employee in the ERP system. The system also auto-generates sequential employee codes and email addresses.

---

## Features

### 1. **Auto-Generated Employee Code**
- **Format**: `EMP + YYMMDD + 5-digit sequence`
- **Example**: `EMP2600001`, `EMP2600002`, etc.
- **Logic**: Generates sequential codes based on the current date
- **File**: `backend/Services/HR/employeeCodeGenerator.ts`

### 2. **Auto-Generated Email Address**
- **Format**: `firstname.lastname@college.edu.in`
- **Example**: `john.doe@college.edu.in`
- **Logic**: Converts names to lowercase and removes special characters
- **File**: `backend/Services/HR/emailGenerator.ts`

### 3. **Auto-Create User Account**
- When an employee is created, a corresponding UserAccount is automatically created
- **Username**: Uses the auto-generated employee code
- **Email**: Uses the auto-generated email address
- **Password**: A temporary secure password is generated
- **Roles**: Default role is `ROLE_STAFF`
- **Status**: User account is enabled by default
- **File**: `backend/Services/HR/Employee.service.ts`

### 4. **Login Support**
Users can login using:
- **Employee Code** (e.g., `EMP2600001`)
- **Email** (e.g., `john.doe@college.edu.in`)
- **Username** (same as employee code)
- **File**: `backend/Services/Auth/UserAccount.ts`

---

## API Endpoints

### Create Employee (Auto Creates User)

**Endpoint**: `POST /api/v1/employees`

**Request Body**:
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "designation": "Assistant Professor",
  "employeeType": "TEACHING",
  "joiningDate": "2024-01-15",
  "basicSalary": 50000,
  "address": "123 Main St",
  "department": "60d5ec49c1234567890abcde"
}
```

**Note**: `employeeCode` and `email` are optional. If not provided, they will be auto-generated.

**Response**:
```json
{
  "success": true,
  "message": "Employee and user account created successfully",
  "data": {
    "employee": {
      "_id": "60d5ec49c1234567890abcde",
      "employeeCode": "EMP2600001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@college.edu.in",
      "phone": "9876543210",
      "designation": "Assistant Professor",
      "employeeType": "TEACHING",
      "status": "ACTIVE",
      "createdAt": "2024-05-30T10:30:00Z"
    },
    "userAccount": {
      "id": "60d5ec49c1234567890abcdf",
      "username": "EMP2600001",
      "email": "john.doe@college.edu.in",
      "fullName": "John Doe",
      "roles": ["ROLE_STAFF"]
    },
    "tempPassword": "K#9mL@4xP2nQ",
    "error": null
  }
}
```

---

## Authentication Flow

### Login Request

**Endpoint**: `POST /api/v1/auth/login`

**Option 1 - Using Employee Code**:
```json
{
  "username": "EMP2600001",
  "password": "K#9mL@4xP2nQ"
}
```

**Option 2 - Using Email**:
```json
{
  "email": "john.doe@college.edu.in",
  "password": "K#9mL@4xP2nQ"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "60d5ec49c1234567890abcdf",
      "username": "EMP2600001",
      "email": "john.doe@college.edu.in",
      "fullName": "John Doe",
      "roles": ["ROLE_STAFF"]
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

---

## Modified Files

### 1. **backend/Services/HR/Employee.service.ts**
- Added auto-generation of employee code
- Added auto-generation of email
- Added auto-creation of UserAccount
- Added temporary password generation
- Modified `ICreateEmployeeInput` to make `employeeCode` and `email` optional

### 2. **backend/Services/HR/employeeCodeGenerator.ts** (NEW)
- Utility function to generate sequential employee codes
- Format: `EMP + YYMMDD + 5-digit sequence`

### 3. **backend/Services/HR/emailGenerator.ts** (NEW)
- Utility function to generate email from employee name
- Format: `firstname.lastname@college.edu.in`

### 4. **backend/Services/Auth/UserAccount.ts**
- Enhanced `authenticate()` method to support multiple login options
- Now supports login with employee code, email, or username

### 5. **backend/controllers/HR/Employee.controller.ts**
- Updated `createEmployee()` to handle new response format
- Returns employee data, user account details, and temporary password

### 6. **backend/Interfaces/HR/Employee.ts**
- Updated interface to include `createdAt` and `updatedAt` timestamps

---

## Workflow Diagram

```
HR creates Employee
        ↓
[Employee Service]
        ↓
Generate Employee Code (EMP2600001)
        ↓
Generate Email (name@college.edu.in)
        ↓
Create Employee Record in DB
        ↓
Generate Temporary Password
        ↓
[UserAccount Service]
        ↓
Create User Account with:
  - username: employee code
  - email: auto-generated
  - password: temporary password
  - roles: ROLE_STAFF
  - employee: reference to created employee
        ↓
Return Response with:
  - Employee Data
  - User Account Details
  - Temporary Password (for HR to share)
```

---

## Security Considerations

1. **Temporary Password**: 
   - 12 characters long
   - Contains uppercase, lowercase, numbers, and special characters
   - HR should share this securely with the employee
   - Employee should change password on first login

2. **Email Uniqueness**:
   - System checks for duplicate emails before creation
   - Email format ensures uniqueness based on first and last name

3. **Employee Code Uniqueness**:
   - System generates unique codes based on date
   - Handles edge cases for multiple employees on same day

4. **Password Hashing**:
   - Passwords are hashed using bcrypt (cost factor: 10)
   - Never stored or transmitted in plain text

---

## Error Handling

If user account creation fails (e.g., duplicate email):
- Employee is still created successfully
- Error message is returned in the response
- HR can manually create user account later if needed

Example Response on Partial Failure:
```json
{
  "success": true,
  "message": "Employee and user account created successfully",
  "data": {
    "employee": { /* employee data */ },
    "userAccount": null,
    "tempPassword": null,
    "error": "Username or email already exists"
  }
}
```

---

## Testing

### Test Case 1: Basic Employee Creation
```bash
curl -X POST http://localhost:5000/api/v1/employees \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "9876543211",
    "designation": "Lecturer",
    "employeeType": "TEACHING"
  }'
```

### Test Case 2: Login with Employee Code
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "EMP2600001",
    "password": "K#9mL@4xP2nQ"
  }'
```

### Test Case 3: Login with Email
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane.smith@college.edu.in",
    "password": "K#9mL@4xP2nQ"
  }'
```

---

## FAQ

**Q: Can I provide custom employee code and email?**
A: Yes, you can provide them in the request. If not provided, they will be auto-generated.

**Q: What if the generated email already exists?**
A: The system will throw an error and not create either the employee or user account.

**Q: How do I change the email domain from `college.edu.in`?**
A: Modify the `emailGenerator.ts` file and update the domain in the `generateEmailFromName()` function.

**Q: How do I change the employee code format?**
A: Modify the `employeeCodeGenerator.ts` file and update the format logic in the `generateEmployeeCode()` function.

**Q: Can employees change their username?**
A: No, the username is based on the employee code which should remain fixed for identification purposes.

---

## Support

For issues or questions about this feature, please contact the development team.
