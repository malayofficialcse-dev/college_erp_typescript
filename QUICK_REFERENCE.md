# 🚀 Quick Reference - Core System Commands

## ⚡ Quick Start

```bash
# Start Backend (Port 5000)
cd backend && npm start

# Start Frontend (Port 5173)  
cd frontend && npm run dev

# Then open: http://localhost:5173
```

## 📋 Core System Modules

Click any module name in "Core System" sidebar menu:

### Academic Setup (Foundation)
1. **Academic Years** - Create yearly cycles
2. **Semesters** - Define semester structure
3. **Departments** - Setup departments
4. **Courses** - Add course offerings

### People Management
5. **Students** - Register students
6. **Teachers** - Add faculty
7. **Classrooms** - Setup classrooms

### Class Structure
8. **Sections** - Create class sections
9. **Subjects** - Define subjects
10. **Subject Assignments** - Assign teachers
11. **Sessions** - Configure sessions

### Academic Operations
12. **Timetable** - Schedule classes
13. **Attendance** - Mark attendance
14. **Exam Schedules** - Plan exams
15. **Exam Results** - Record grades

### Special Features
16. **Admissions** - Manage admissions
17. **Admission EMI** - Payment plans
18. **Counseling** - Counseling sessions

## 🎯 Common Tasks

### ➕ Add New Record
```
1. Click Module → Click "Add" Button
2. Fill Form Fields
3. Click "Save"
```

### ✏️ Edit Record
```
1. Click Module
2. Find row in table
3. Click Edit Icon (pencil)
4. Change values
5. Click "Save Changes"
```

### 🗑️ Delete Record
```
1. Click Module
2. Find row in table
3. Click Delete Icon (trash)
4. Confirm deletion
```

## 📊 Module Dependencies (Create in Order)

```
1. Academic Years
2. Semesters  
3. Departments
4. Courses
5. Subjects
6. Classrooms
7. Students (links to Departments)
8. Teachers (links to Departments)
9. Sections (links to all above)
10. Subject Assignments (links to Teachers, Subjects)
11. Timetable (links to all entities)
12. Exam Schedules
13. Attendance
14. Admissions
15. Sessions
```

## 🔗 Common Relations

| Module | Links To |
|--------|----------|
| Students | Departments |
| Courses | Departments |
| Teachers | Departments |
| Subjects | Courses, Semesters |
| Sections | Departments, Courses, Semesters, Teachers |
| Timetable | Sections, Subjects, Teachers, Classrooms |
| Exam Schedules | Courses, Semesters, Subjects |
| Subject Assignments | Teachers, Subjects, Courses |
| Admissions | Courses, Academic Years |
| Exam Results | Students, Subjects |
| Attendance | Students, Subjects |
| Counseling | Students, Teachers |

## 📱 Form Field Types

- **Text** - Enter text freely
- **Number** - Enter digits only
- **Email** - Email format validation
- **Date** - Click calendar to select
- **Time** - Click clock to select
- **Select** - Choose from dropdown
- **Checkbox** - Click to toggle on/off
- **Textarea** - Multi-line text field

## ✅ Form Tips

- 🔴 **Red label** = Required field
- ⚪ **Gray label** = Optional field
- 📋 **Select field** = Auto-filled from related module
- ❌ Can't save? → Check red errors
- 📥 Dropdown empty? → Create records in related module first

## 🔍 View Data

- **Table Shows**: All records with key information
- **Scroll Down**: More records (if many)
- **Find Text**: Use Ctrl+F to search on page
- **Click Row**: Shows all columns (horizontal scroll)

## 🛠️ Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Check port 5000 not in use |
| Frontend won't start | Check port 5173 not in use |
| Dropdown empty | Create records in related module |
| Can't save form | Fill all required (red) fields |
| 404 error | Ensure backend running |
| Page blank | Refresh (F5) or check console |
| Can't login | Check backend is running |

## 🌐 URLs

| Component | URL |
|-----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api/v1 |
| Health Check | http://localhost:5000/api/v1/health |

## 📂 Project Structure

```
college_erp_typescript/
├── backend/
│   ├── Models/Core/        → Database schemas
│   ├── controllers/Core/    → API logic
│   ├── routes/Core/         → API endpoints
│   ├── app.ts             → Express setup
│   └── server.ts          → Start point
│
└── frontend/
    ├── src/pages/Core/    → All Core modules
    ├── src/App.jsx        → Routes
    ├── src/components/    → UI components
    └── package.json       → Dependencies
```

## 🔐 Authentication

- Uses Bearer token in Authorization header
- Auto-injected by API service
- Stored in localStorage as 'token'
- Expires based on backend config

## 📞 Getting Help

1. **Check USER_GUIDE.md** - Detailed instructions
2. **Check VERIFICATION_CHECKLIST.md** - All features listed
3. **Check browser console** - Errors and logs
4. **Check backend logs** - API errors
5. **Check DevTools Network tab** - API requests

## 🎓 Best Practices

✅ Create Academic Years first
✅ Then Semesters
✅ Then Departments
✅ Then Courses
✅ Then Students/Teachers
✅ Then Sections
✅ Finally Timetable/Schedules

✖️ Don't delete core records if in use
✖️ Don't create duplicate codes
✖️ Don't use special characters in codes
✖️ Don't fill optional fields unless needed

## 🚀 Next Level

- **Add Search** - In modules to filter records
- **Add Reports** - Generate analytics
- **Add Bulk Import** - Upload CSV
- **Add Notifications** - Alert users
- **Add Attachments** - Store documents
- **Add History** - Track changes

---

**Status**: ✅ Ready to Use
**Last Update**: 2025-05-29
**Questions?** See USER_GUIDE.md
