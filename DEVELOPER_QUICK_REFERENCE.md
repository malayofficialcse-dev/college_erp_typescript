# Auto User Creation - Developer Quick Reference

## 🎯 What Changed?

When an HR admin creates an employee, a user account is **automatically created** with:
- Username = Employee Code (e.g., `EMP2600001`)
- Email = Auto-generated (e.g., `john.doe@college.edu.in`)
- Password = Temporary secure password (e.g., `K#9mL@4xP2nQ`)

## 📁 Modified Files

### Core Changes
| File | What Changed | Impact |
|------|-------------|--------|
| `backend/Services/HR/Employee.service.ts` | Added auto-generation & user creation | Employee creation now returns UserAccount data |
| `backend/Services/Auth/UserAccount.ts` | Enhanced authenticate() | Can login with code or email |
| `backend/controllers/HR/Employee.controller.ts` | Updated response format | Returns temp password |

### New Files
| File | Purpose |
|------|---------|
| `backend/Services/HR/employeeCodeGenerator.ts` | Generate sequential employee codes |
| `backend/Services/HR/emailGenerator.ts` | Generate emails from names |

## 🔧 Code Snippets

### Employee Creation Request
```json
POST /api/v1/employees
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "9876543210",
  "designation": "Professor",
  "employeeType": "TEACHING"
}
```

### Response Includes
```json
{
  "success": true,
  "data": {
    "employee": { /* full employee object */ },
    "userAccount": {
      "id": "...",
      "username": "EMP2600001",
      "email": "john.doe@college.edu.in",
      "fullName": "John Doe",
      "roles": ["ROLE_STAFF"]
    },
    "tempPassword": "K#9mL@4xP2nQ"
  }
}
```

### Login Options
```bash
# Option 1: With Employee Code
{
  "usernameOrEmail": "EMP2600001",
  "password": "K#9mL@4xP2nQ"
}

# Option 2: With Email
{
  "usernameOrEmail": "john.doe@college.edu.in",
  "password": "K#9mL@4xP2nQ"
}
```

## 🛠️ Key Functions

### Generate Employee Code
```typescript
const code = await generateEmployeeCode();
// Returns: "EMP2600001", "EMP2600002", etc.
```

### Generate Email
```typescript
const email = generateEmailFromName("John", "Doe");
// Returns: "john.doe@college.edu.in"
```

### Authenticate User
```typescript
const user = await userAccountService.authenticate(
  "EMP2600001",  // or "john.doe@college.edu.in"
  "K#9mL@4xP2nQ"
);
```

## 📊 Database Flow

```
Employee Created
    ↓
    ├─ Save to Employee collection
    │
    ├─ Generate temp password
    │
    └─ Create UserAccount with employee reference
```

## ✅ Validation Rules

| Field | Required | Auto-Generated | Format |
|-------|----------|---|--------|
| employeeCode | ❌ | ✅ | EMP + YYMMDD + 5 digits |
| email | ❌ | ✅ | firstname.lastname@college.edu.in |
| firstName | ✅ | ❌ | Any string |
| lastName | ✅ | ❌ | Any string |
| password | N/A | ✅ (temp) | 12 chars, mixed types |
| roles | ❌ | ✅ | ["ROLE_STAFF"] |

## 🔐 Security Notes

- Temporary passwords should be shared securely (not in logs/emails)
- Passwords are hashed with bcrypt (never stored plain)
- Employee code uniqueness checked before creation
- Email uniqueness checked before creation

## 🐛 Troubleshooting

### Issue: Employee created but UserAccount failed
**Solution**: Both objects are created successfully anyway. Error details provided for debugging.

### Issue: Duplicate email error
**Solution**: Email already exists. Use different first/last name or provide custom email.

### Issue: Duplicate employee code error
**Solution**: Code already exists. Provide custom code or check generation logic.

### Issue: Login fails
**Solution**: Check that UserAccount has `enabled: true` and password is correct.

## 📚 Related Files

- API Documentation: `AUTO_USER_CREATION_FEATURE.md`
- Technical Flows: `TECHNICAL_FLOW.md`
- Full Summary: `IMPLEMENTATION_SUMMARY.md`

## 🚀 Common Tasks

### Create Multiple Employees
```typescript
const employees = [
  { firstName: "John", lastName: "Doe", ... },
  { firstName: "Jane", lastName: "Smith", ... }
];

for (const emp of employees) {
  const result = await createEmployeeService(emp);
  console.log(`Created ${result.employee.employeeCode}`);
  console.log(`Temp Password: ${result.tempPassword}`);
}
```

### Find Employee by Email
```typescript
const employee = await Employee.findOne({
  email: "john.doe@college.edu.in"
});
```

### Find UserAccount by Employee Code
```typescript
const user = await UserAccount.findOne({
  username: "EMP2600001"
});
```

## 📞 Contact

For issues or questions, refer to the comprehensive documentation files included in this module.
