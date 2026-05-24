import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api', // Toggle USE_MOCKS below to point to a real Spring Boot server
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// -------------------------------------------------------------
// LOCAL FRONTEND TESTING DATABASE
// -------------------------------------------------------------
const initialDB = {
  academicYears: [
    { id: 1, name: '2024-2025', startDate: '2024-06-01', endDate: '2025-05-31', status: 'INACTIVE' },
    { id: 2, name: '2025-2026', startDate: '2025-06-01', endDate: '2026-05-31', status: 'ACTIVE' },
    { id: 3, name: '2026-2027', startDate: '2026-06-01', endDate: '2027-05-31', status: 'INACTIVE' },
  ],
  semesters: [
    { id: 1, name: 'Semester 1', status: 'ACTIVE', academicYear: { id: 2, name: '2025-2026' } },
    { id: 2, name: 'Semester 2', status: 'ACTIVE', academicYear: { id: 2, name: '2025-2026' } },
    { id: 3, name: 'Semester 3', status: 'INACTIVE', academicYear: { id: 2, name: '2025-2026' } },
    { id: 4, name: 'Semester 4', status: 'INACTIVE', academicYear: { id: 2, name: '2025-2026' } },
  ],
  departments: [
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE', description: 'Department of Computer Science and Engineering' },
    { id: 2, name: 'Electronics & Communication', code: 'ECE', description: 'Department of Electronics and Communication Engineering' },
    { id: 3, name: 'Electrical Engineering', code: 'EE', description: 'Department of Electrical Engineering' },
    { id: 4, name: 'Mechanical Engineering', code: 'ME', description: 'Department of Mechanical Engineering' },
  ],
  courses: [
    { id: 1, title: 'Bachelor of Technology in CSE', courseCode: 'BTECH-CSE', credits: 180, description: '4-Year Undergraduate Program', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },
    { id: 2, title: 'Master of Technology in ECE', courseCode: 'MTECH-ECE', credits: 90, description: '2-Year Postgraduate Program', department: { id: 2, name: 'Electronics & Communication', code: 'ECE' } },
  ],
  subjects: [
    { id: 1, name: 'Database Management Systems', code: 'CSE-301', creditHours: 4, semester: { id: 1, name: 'Semester 1' } },
    { id: 2, name: 'Object-Oriented Programming', code: 'CSE-302', creditHours: 3, semester: { id: 1, name: 'Semester 1' } },
    { id: 3, name: 'Digital Electronics', code: 'ECE-101', creditHours: 4, semester: { id: 2, name: 'Semester 2' } },
  ],
  teachers: [
    { id: 1, teacherId: 'TCH001', firstName: 'Dr. Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@institution.edu', phone: '9876543210', designation: 'Professor', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },
    { id: 2, teacherId: 'TCH002', firstName: 'Dr. Priya', lastName: 'Sharma', email: 'priya.sharma@institution.edu', phone: '9876543211', designation: 'Associate Professor', department: { id: 2, name: 'Electronics & Communication', code: 'ECE' } },
  ],
  students: [
    { id: 1, enrollmentNumber: 'CSE25001', firstName: 'Amit', lastName: 'Sharma', email: 'amit.sharma@student.edu', phone: '9988776655', gender: 'Male', dateOfBirth: '2004-05-12', guardianName: 'Vijay Sharma', guardianPhone: '9988776600', address: '123 Tech Park Road, Sector 5', currentSemester: 1, status: 'ACTIVE', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },

    { id: 2, enrollmentNumber: 'CSE25002', firstName: 'Neha', lastName: 'Patel', email: 'neha.patel@student.edu', phone: '9876598765', gender: 'Female', dateOfBirth: '2003-09-18', guardianName: 'Sanjay Patel', guardianPhone: '9876598700', address: '45 Green Avenue, Suite C', currentSemester: 1, status: 'ACTIVE', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },

    { id: 3, enrollmentNumber: 'ECE25001', firstName: 'Rahul', lastName: 'Verma', email: 'rahul.verma@student.edu', phone: '9555443322', gender: 'Male', dateOfBirth: '2004-11-20', guardianName: 'Ramesh Verma', guardianPhone: '9555443300', address: 'Block D, Metro Residency', currentSemester: 2, status: 'ACTIVE', department: { id: 2, name: 'Electronics & Communication', code: 'ECE' } },

    { id: 4, enrollmentNumber: 'ME25001', firstName: 'Priya', lastName: 'Nair', email: 'priya.nair@student.edu', phone: '9001122334', gender: 'Female', dateOfBirth: '2004-01-15', guardianName: 'Anil Nair', guardianPhone: '9001122300', address: 'Hill View Colony', currentSemester: 1, status: 'ACTIVE', department: { id: 3, name: 'Mechanical Engineering', code: 'ME' } },

    { id: 5, enrollmentNumber: 'CIV25001', firstName: 'Karan', lastName: 'Singh', email: 'karan.singh@student.edu', phone: '9887766554', gender: 'Male', dateOfBirth: '2003-07-11', guardianName: 'Ajay Singh', guardianPhone: '9887766500', address: 'Lake City Apartments', currentSemester: 3, status: 'ACTIVE', department: { id: 4, name: 'Civil Engineering', code: 'CIV' } },

    { id: 6, enrollmentNumber: 'EEE25001', firstName: 'Sneha', lastName: 'Roy', email: 'sneha.roy@student.edu', phone: '9112233445', gender: 'Female', dateOfBirth: '2004-03-09', guardianName: 'Arup Roy', guardianPhone: '9112233400', address: 'MG Road, Kolkata', currentSemester: 2, status: 'ACTIVE', department: { id: 5, name: 'Electrical Engineering', code: 'EEE' } },

    { id: 7, enrollmentNumber: 'CSE25003', firstName: 'Aditya', lastName: 'Das', email: 'aditya.das@student.edu', phone: '9223344556', gender: 'Male', dateOfBirth: '2004-06-22', guardianName: 'Subhash Das', guardianPhone: '9223344500', address: 'Techno City, Phase 2', currentSemester: 1, status: 'ACTIVE', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },

    { id: 8, enrollmentNumber: 'ECE25002', firstName: 'Ananya', lastName: 'Ghosh', email: 'ananya.ghosh@student.edu', phone: '9334455667', gender: 'Female', dateOfBirth: '2003-12-10', guardianName: 'Sukumar Ghosh', guardianPhone: '9334455600', address: 'Sunrise Residency', currentSemester: 2, status: 'ACTIVE', department: { id: 2, name: 'Electronics & Communication', code: 'ECE' } },

    { id: 9, enrollmentNumber: 'ME25002', firstName: 'Rohit', lastName: 'Yadav', email: 'rohit.yadav@student.edu', phone: '9445566778', gender: 'Male', dateOfBirth: '2004-08-14', guardianName: 'Mahesh Yadav', guardianPhone: '9445566700', address: 'Industrial Area Road', currentSemester: 1, status: 'ACTIVE', department: { id: 3, name: 'Mechanical Engineering', code: 'ME' } },

    { id: 10, enrollmentNumber: 'CSE25004', firstName: 'Pooja', lastName: 'Mishra', email: 'pooja.mishra@student.edu', phone: '9556677889', gender: 'Female', dateOfBirth: '2003-05-25', guardianName: 'Raj Mishra', guardianPhone: '9556677800', address: 'Central Park Residency', currentSemester: 4, status: 'ACTIVE', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },

    { id: 11, enrollmentNumber: 'EEE25002', firstName: 'Vikas', lastName: 'Pandey', email: 'vikas.pandey@student.edu', phone: '9667788990', gender: 'Male', dateOfBirth: '2004-09-17', guardianName: 'Rakesh Pandey', guardianPhone: '9667788900', address: 'Green Valley Homes', currentSemester: 2, status: 'ACTIVE', department: { id: 5, name: 'Electrical Engineering', code: 'EEE' } },

    { id: 12, enrollmentNumber: 'CIV25002', firstName: 'Ishita', lastName: 'Chakraborty', email: 'ishita.chakraborty@student.edu', phone: '9778899001', gender: 'Female', dateOfBirth: '2004-04-02', guardianName: 'Pradip Chakraborty', guardianPhone: '9778899000', address: 'South Avenue Street', currentSemester: 1, status: 'ACTIVE', department: { id: 4, name: 'Civil Engineering', code: 'CIV' } },

    { id: 13, enrollmentNumber: 'CSE25005', firstName: 'Arjun', lastName: 'Kapoor', email: 'arjun.kapoor@student.edu', phone: '9889900112', gender: 'Male', dateOfBirth: '2003-11-30', guardianName: 'Sunil Kapoor', guardianPhone: '9889900100', address: 'Royal Heights', currentSemester: 3, status: 'ACTIVE', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },

    { id: 14, enrollmentNumber: 'ECE25003', firstName: 'Meera', lastName: 'Iyer', email: 'meera.iyer@student.edu', phone: '9990011223', gender: 'Female', dateOfBirth: '2004-02-18', guardianName: 'Ravi Iyer', guardianPhone: '9990011200', address: 'Palm Residency', currentSemester: 2, status: 'ACTIVE', department: { id: 2, name: 'Electronics & Communication', code: 'ECE' } },

    { id: 15, enrollmentNumber: 'ME25003', firstName: 'Siddharth', lastName: 'Jain', email: 'siddharth.jain@student.edu', phone: '9001020304', gender: 'Male', dateOfBirth: '2004-07-21', guardianName: 'Ankit Jain', guardianPhone: '9001020300', address: 'Silver Oak Apartments', currentSemester: 1, status: 'ACTIVE', department: { id: 3, name: 'Mechanical Engineering', code: 'ME' } },

    // 16 - 45

    { id: 46, enrollmentNumber: 'CSE25016', firstName: 'Nitin', lastName: 'Bose', email: 'nitin.bose@student.edu', phone: '9111223344', gender: 'Male', dateOfBirth: '2003-06-19', guardianName: 'Sanjay Bose', guardianPhone: '9111223300', address: 'Blue Sky Residency', currentSemester: 4, status: 'ACTIVE', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },

    { id: 47, enrollmentNumber: 'ECE25010', firstName: 'Riya', lastName: 'Sen', email: 'riya.sen@student.edu', phone: '9222334455', gender: 'Female', dateOfBirth: '2004-10-08', guardianName: 'Amit Sen', guardianPhone: '9222334400', address: 'City Tower Apartments', currentSemester: 2, status: 'ACTIVE', department: { id: 2, name: 'Electronics & Communication', code: 'ECE' } },

    { id: 48, enrollmentNumber: 'EEE25009', firstName: 'Dev', lastName: 'Mukherjee', email: 'dev.mukherjee@student.edu', phone: '9333445566', gender: 'Male', dateOfBirth: '2004-01-28', guardianName: 'Sourav Mukherjee', guardianPhone: '9333445500', address: 'Metro Plaza', currentSemester: 3, status: 'ACTIVE', department: { id: 5, name: 'Electrical Engineering', code: 'EEE' } },

    { id: 49, enrollmentNumber: 'CIV25008', firstName: 'Tanya', lastName: 'Arora', email: 'tanya.arora@student.edu', phone: '9444556677', gender: 'Female', dateOfBirth: '2003-03-12', guardianName: 'Kamal Arora', guardianPhone: '9444556600', address: 'Garden Estate', currentSemester: 5, status: 'ACTIVE', department: { id: 4, name: 'Civil Engineering', code: 'CIV' } },

    { id: 50, enrollmentNumber: 'ME25009', firstName: 'Yash', lastName: 'Malhotra', email: 'yash.malhotra@student.edu', phone: '9555667788', gender: 'Male', dateOfBirth: '2004-12-01', guardianName: 'Rohit Malhotra', guardianPhone: '9555667700', address: 'Sunshine Residency', currentSemester: 2, status: 'ACTIVE', department: { id: 3, name: 'Mechanical Engineering', code: 'ME' } }

  ],
  attendance: [
    { id: 1, studentId: 1, studentName: 'Amit Sharma', enrollmentNumber: 'CSE25001', subjectId: 1, subjectName: 'Database Management Systems', date: '2026-05-18', status: 'PRESENT' },
    { id: 2, studentId: 2, studentName: 'Neha Patel', enrollmentNumber: 'CSE25002', subjectId: 1, subjectName: 'Database Management Systems', date: '2026-05-18', status: 'PRESENT' },
    { id: 3, studentId: 3, studentName: 'Rahul Verma', enrollmentNumber: 'ECE25001', subjectId: 3, subjectName: 'Digital Electronics', date: '2026-05-18', status: 'ABSENT' },
  ],
  examResults: [
    { id: 1, studentId: 1, studentName: 'Amit Sharma', enrollmentNumber: 'CSE25001', subjectId: 1, subjectName: 'Database Management Systems', marksObtained: 85, maxMarks: 100, grade: 'A', examType: 'Mid-Term' },
    { id: 2, studentId: 2, studentName: 'Neha Patel', enrollmentNumber: 'CSE25002', subjectId: 1, subjectName: 'Database Management Systems', marksObtained: 92, maxMarks: 100, grade: 'A+', examType: 'Mid-Term' },
    { id: 3, studentId: 3, studentName: 'Rahul Verma', enrollmentNumber: 'ECE25001', subjectId: 3, subjectName: 'Digital Electronics', marksObtained: 78, maxMarks: 100, grade: 'B', examType: 'Mid-Term' },
  ],
  employees: [

    { id: 1, employeeId: 'EMP001', firstName: 'John', lastName: 'Doe', email: 'john.doe@institution.edu', phone: '9000111222', designation: 'Registrar', employeeType: 'ADMIN', salary: 75000 },
    { id: 2, employeeId: 'EMP002', firstName: 'Sarah', lastName: 'Connor', email: 'sarah.connor@institution.edu', phone: '9000111223', designation: 'Librarian', employeeType: 'STAFF', salary: 45000 },
    { id: 3, employeeId: 'EMP003', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@institution.edu', phone: '9000111224', designation: 'Professor', employeeType: 'FACULTY', salary: 95000 },
    { id: 4, employeeId: 'EMP004', firstName: 'Emily', lastName: 'Watson', email: 'emily.watson@institution.edu', phone: '9000111225', designation: 'HR Manager', employeeType: 'ADMIN', salary: 68000 },
    { id: 5, employeeId: 'EMP005', firstName: 'Michael', lastName: 'Brown', email: 'michael.brown@institution.edu', phone: '9000111226', designation: 'Assistant Professor', employeeType: 'FACULTY', salary: 72000 },
    { id: 6, employeeId: 'EMP006', firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@institution.edu', phone: '9000111227', designation: 'Accountant', employeeType: 'STAFF', salary: 52000 },
    { id: 7, employeeId: 'EMP007', firstName: 'David', lastName: 'Miller', email: 'david.miller@institution.edu', phone: '9000111228', designation: 'Dean', employeeType: 'ADMIN', salary: 120000 },
    { id: 8, employeeId: 'EMP008', firstName: 'Anjali', lastName: 'Verma', email: 'anjali.verma@institution.edu', phone: '9000111229', designation: 'Lab Assistant', employeeType: 'STAFF', salary: 38000 },
    { id: 9, employeeId: 'EMP009', firstName: 'Robert', lastName: 'Wilson', email: 'robert.wilson@institution.edu', phone: '9000111230', designation: 'Professor', employeeType: 'FACULTY', salary: 98000 },
    { id: 10, employeeId: 'EMP010', firstName: 'Sneha', lastName: 'Patel', email: 'sneha.patel@institution.edu', phone: '9000111231', designation: 'Receptionist', employeeType: 'STAFF', salary: 32000 },

    { id: 11, employeeId: 'EMP011', firstName: 'Amit', lastName: 'Roy', email: 'amit.roy@institution.edu', phone: '9000111232', designation: 'Assistant Professor', employeeType: 'FACULTY', salary: 70000 },
    { id: 12, employeeId: 'EMP012', firstName: 'Sophia', lastName: 'Taylor', email: 'sophia.taylor@institution.edu', phone: '9000111233', designation: 'Coordinator', employeeType: 'ADMIN', salary: 56000 },
    { id: 13, employeeId: 'EMP013', firstName: 'Daniel', lastName: 'Lee', email: 'daniel.lee@institution.edu', phone: '9000111234', designation: 'System Admin', employeeType: 'STAFF', salary: 64000 },
    { id: 14, employeeId: 'EMP014', firstName: 'Neha', lastName: 'Agarwal', email: 'neha.agarwal@institution.edu', phone: '9000111235', designation: 'Professor', employeeType: 'FACULTY', salary: 93000 },
    { id: 15, employeeId: 'EMP015', firstName: 'Chris', lastName: 'Evans', email: 'chris.evans@institution.edu', phone: '9000111236', designation: 'Sports Officer', employeeType: 'STAFF', salary: 47000 },
    { id: 16, employeeId: 'EMP016', firstName: 'Pooja', lastName: 'Nair', email: 'pooja.nair@institution.edu', phone: '9000111237', designation: 'HR Executive', employeeType: 'ADMIN', salary: 58000 },
    { id: 17, employeeId: 'EMP017', firstName: 'Arjun', lastName: 'Singh', email: 'arjun.singh@institution.edu', phone: '9000111238', designation: 'Lecturer', employeeType: 'FACULTY', salary: 62000 },
    { id: 18, employeeId: 'EMP018', firstName: 'Olivia', lastName: 'Smith', email: 'olivia.smith@institution.edu', phone: '9000111239', designation: 'Clerk', employeeType: 'STAFF', salary: 35000 },
    { id: 19, employeeId: 'EMP019', firstName: 'Karan', lastName: 'Malhotra', email: 'karan.malhotra@institution.edu', phone: '9000111240', designation: 'Vice Principal', employeeType: 'ADMIN', salary: 110000 },
    { id: 20, employeeId: 'EMP020', firstName: 'Lisa', lastName: 'White', email: 'lisa.white@institution.edu', phone: '9000111241', designation: 'Professor', employeeType: 'FACULTY', salary: 97000 },

    { id: 21, employeeId: 'EMP021', firstName: 'Rahul', lastName: 'Das', email: 'rahul.das@institution.edu', phone: '9000111242', designation: 'Accountant', employeeType: 'STAFF', salary: 51000 },
    { id: 22, employeeId: 'EMP022', firstName: 'Emma', lastName: 'Johnson', email: 'emma.johnson@institution.edu', phone: '9000111243', designation: 'Registrar', employeeType: 'ADMIN', salary: 78000 },
    { id: 23, employeeId: 'EMP023', firstName: 'Vikram', lastName: 'Reddy', email: 'vikram.reddy@institution.edu', phone: '9000111244', designation: 'Professor', employeeType: 'FACULTY', salary: 94000 },
    { id: 24, employeeId: 'EMP024', firstName: 'Grace', lastName: 'Hall', email: 'grace.hall@institution.edu', phone: '9000111245', designation: 'Librarian', employeeType: 'STAFF', salary: 46000 },
    { id: 25, employeeId: 'EMP025', firstName: 'Nikhil', lastName: 'Joshi', email: 'nikhil.joshi@institution.edu', phone: '9000111246', designation: 'Dean', employeeType: 'ADMIN', salary: 125000 },

    { id: 26, employeeId: 'EMP026', firstName: 'Ava', lastName: 'Walker', email: 'ava.walker@institution.edu', phone: '9000111247', designation: 'Assistant Professor', employeeType: 'FACULTY', salary: 71000 },
    { id: 27, employeeId: 'EMP027', firstName: 'Suresh', lastName: 'Iyer', email: 'suresh.iyer@institution.edu', phone: '9000111248', designation: 'Office Assistant', employeeType: 'STAFF', salary: 33000 },
    { id: 28, employeeId: 'EMP028', firstName: 'Mia', lastName: 'Harris', email: 'mia.harris@institution.edu', phone: '9000111249', designation: 'Coordinator', employeeType: 'ADMIN', salary: 59000 },
    { id: 29, employeeId: 'EMP029', firstName: 'Harsh', lastName: 'Mehta', email: 'harsh.mehta@institution.edu', phone: '9000111250', designation: 'Professor', employeeType: 'FACULTY', salary: 96000 },
    { id: 30, employeeId: 'EMP030', firstName: 'Noah', lastName: 'Martin', email: 'noah.martin@institution.edu', phone: '9000111251', designation: 'Lab Technician', employeeType: 'STAFF', salary: 42000 },

    // Continue similarly...

    { id: 91, employeeId: 'EMP091', firstName: 'Rohan', lastName: 'Bose', email: 'rohan.bose@institution.edu', phone: '9000111312', designation: 'Professor', employeeType: 'FACULTY', salary: 91000 },
    { id: 92, employeeId: 'EMP092', firstName: 'Charlotte', lastName: 'Young', email: 'charlotte.young@institution.edu', phone: '9000111313', designation: 'Receptionist', employeeType: 'STAFF', salary: 34000 },
    { id: 93, employeeId: 'EMP093', firstName: 'Aditya', lastName: 'Sen', email: 'aditya.sen@institution.edu', phone: '9000111314', designation: 'Dean', employeeType: 'ADMIN', salary: 130000 },
    { id: 94, employeeId: 'EMP094', firstName: 'Ella', lastName: 'King', email: 'ella.king@institution.edu', phone: '9000111315', designation: 'Assistant Professor', employeeType: 'FACULTY', salary: 74000 },
    { id: 95, employeeId: 'EMP095', firstName: 'Manish', lastName: 'Ghosh', email: 'manish.ghosh@institution.edu', phone: '9000111316', designation: 'Clerk', employeeType: 'STAFF', salary: 36000 },
    { id: 96, employeeId: 'EMP096', firstName: 'Isabella', lastName: 'Scott', email: 'isabella.scott@institution.edu', phone: '9000111317', designation: 'HR Manager', employeeType: 'ADMIN', salary: 69000 },
    { id: 97, employeeId: 'EMP097', firstName: 'Abhishek', lastName: 'Pal', email: 'abhishek.pal@institution.edu', phone: '9000111318', designation: 'Professor', employeeType: 'FACULTY', salary: 99000 },
    { id: 98, employeeId: 'EMP098', firstName: 'Amelia', lastName: 'Green', email: 'amelia.green@institution.edu', phone: '9000111319', designation: 'Office Assistant', employeeType: 'STAFF', salary: 35000 },
    { id: 99, employeeId: 'EMP099', firstName: 'Sanjay', lastName: 'Mukherjee', email: 'sanjay.mukherjee@institution.edu', phone: '9000111320', designation: 'Principal', employeeType: 'ADMIN', salary: 150000 },
    { id: 100, employeeId: 'EMP100', firstName: 'Lucas', lastName: 'Adams', email: 'lucas.adams@institution.edu', phone: '9000111321', designation: 'Professor', employeeType: 'FACULTY', salary: 97000 }

  ],
  leaves: [
    { id: 1, employee: { id: 2, firstName: 'Sarah', lastName: 'Connor', employeeId: 'EMP002' }, leaveType: 'Sick Leave', startDate: '2026-05-25', endDate: '2026-05-27', reason: 'Medical checkup', status: 'PENDING' },
    { id: 2, employee: { id: 1, firstName: 'John', lastName: 'Doe', employeeId: 'EMP001' }, leaveType: 'Casual Leave', startDate: '2026-05-10', endDate: '2026-05-11', reason: 'Family event', status: 'APPROVED' },
  ],
  payroll: [
    { id: 1, employee: { id: 1, firstName: 'John', lastName: 'Doe', employeeId: 'EMP001' }, month: 'May', year: 2026, basicSalary: 75000, allowances: 5000, deductions: 2000, netSalary: 78000, status: 'PAID' },
    { id: 2, employee: { id: 2, firstName: 'Sarah', lastName: 'Connor', employeeId: 'EMP002' }, month: 'May', year: 2026, basicSalary: 45000, allowances: 3000, deductions: 1000, netSalary: 47000, status: 'PENDING' },
  ],
  fees: [
    { id: 1, student: { id: 1, firstName: 'Amit', lastName: 'Sharma', enrollmentNumber: 'CSE25001' }, feeType: 'Tuition Fee', amount: 25000, dueDate: '2026-06-30', status: 'PAID', transactionId: 'TXN83748293' },
    { id: 2, student: { id: 2, firstName: 'Neha', lastName: 'Patel', enrollmentNumber: 'CSE25002' }, feeType: 'Tuition Fee', amount: 25000, dueDate: '2026-06-30', status: 'UNPAID', transactionId: '' },
    { id: 3, student: { id: 3, firstName: 'Rahul', lastName: 'Verma', enrollmentNumber: 'ECE25001' }, feeType: 'Hostel Fee', amount: 15000, dueDate: '2026-06-15', status: 'PAID', transactionId: 'TXN83748299' },
  ],
  admissions: [
    {
      id: 1,
      admissionNumber: 'ADM2026001',
      student: { id: 1, firstName: 'Amit', lastName: 'Sharma', enrollmentNumber: 'CSE25001' },
      course: { id: 1, title: 'Bachelor of Technology in CSE', courseCode: 'BTECH-CSE', department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' } },
      department: { id: 1, name: 'Computer Science & Engineering', code: 'CSE' },
      academicYear: '2025-26',
      admissionDate: '2025-06-15',
      totalFeeAmount: 40000,
      discountAmount: 5000,
      netPayableAmount: 35000,
      amountPaid: 35000,
      balanceDue: 0,
      paymentPlan: 'FULL',
      status: 'ACTIVE',
      remarks: 'Enrolled for first semester',
      billNumber: 'BILL2026001'
    }
  ],
  scholarships: [
    { id: 1, name: 'Merit Cum Means Scholarship', description: 'For students with CGPA > 8.5 and family income under 3L', amount: 15000, status: 'ACTIVE' },
    { id: 2, name: 'Sports Excellence Award', description: 'For national-level sports champions', amount: 10000, status: 'ACTIVE' },
  ],
  books: [
    { id: 1, title: 'Introduction to Algorithms', author: 'Cormen, Leiserson, Rivest, Stein', isbn: '978-0262033848', category: 'Computer Science', totalCopies: 10, availableCopies: 7, status: 'AVAILABLE' },
    { id: 2, title: 'Database System Concepts', author: 'Silberschatz, Korth, Sudarshan', isbn: '978-0073523323', category: 'Computer Science', totalCopies: 8, availableCopies: 8, status: 'AVAILABLE' },
    { id: 3, title: 'Principles of Electromagnetics', author: 'Matthew N.O. Sadiku', isbn: '978-0199461851', category: 'Electronics', totalCopies: 5, availableCopies: 0, status: 'NOT_AVAILABLE' },
  ],
  overdueIssues: [
    { id: 1, bookTitle: 'Introduction to Algorithms', studentName: 'Amit Sharma', enrollmentNumber: 'CSE25001', issueDate: '2026-04-10', dueDate: '2026-04-24', fineAmount: 150 },
    { id: 2, bookTitle: 'Principles of Electromagnetics', studentName: 'Rahul Verma', enrollmentNumber: 'ECE25001', issueDate: '2026-04-15', dueDate: '2026-04-29', fineAmount: 100 },
  ],
  rooms: [
    { id: 1, hostelName: 'Boys Hostel A', roomNumber: '101', capacity: 3, currentOccupants: 2, type: 'BOYS', status: 'AVAILABLE' },
    { id: 2, hostelName: 'Girls Hostel B', roomNumber: '202', capacity: 2, currentOccupants: 2, type: 'GIRLS', status: 'FULL' },
    { id: 3, hostelName: 'Boys Hostel A', roomNumber: '102', capacity: 3, currentOccupants: 1, type: 'BOYS', status: 'AVAILABLE' },
  ],
  hostelAllocations: [
    { id: 1, student: { id: 1, firstName: 'Amit', lastName: 'Sharma', enrollmentNumber: 'CSE25001' }, hostelName: 'Boys Hostel A', roomNumber: '101', allocationDate: '2025-07-15' },
    { id: 2, student: { id: 2, firstName: 'Neha', lastName: 'Patel', enrollmentNumber: 'CSE25002' }, hostelName: 'Girls Hostel B', roomNumber: '202', allocationDate: '2025-07-15' },
  ],
  vehicles: [
    { id: 1, vehicleNumber: 'DL-1CA-1234', driverName: 'Satish Singh', driverPhone: '9988009988', capacity: 40, status: 'ACTIVE' },
    { id: 2, vehicleNumber: 'DL-1CA-5678', driverName: 'Mohan Lal', driverPhone: '9988005678', capacity: 32, status: 'ACTIVE' },
  ],
  routes: [
    { id: 1, routeName: 'Route 1 - East Delhi to Campus', vehicleNumber: 'DL-1CA-1234', driverName: 'Satish Singh', driverPhone: '9988009988', capacity: 40, status: 'ACTIVE' },
    { id: 2, routeName: 'Route 2 - Noida Sector 62 to Campus', vehicleNumber: 'DL-1CA-5678', driverName: 'Mohan Lal', driverPhone: '9988005678', capacity: 32, status: 'ACTIVE' },
  ],
  transportAllocations: [
    { id: 1, student: { id: 1, firstName: 'Amit', lastName: 'Sharma', enrollmentNumber: 'CSE25001' }, routeName: 'Route 1 - East Delhi to Campus', vehicleNumber: 'DL-1CA-1234', allocationDate: '2025-07-15' },
    { id: 2, student: { id: 3, firstName: 'Rahul', lastName: 'Verma', enrollmentNumber: 'ECE25001' }, routeName: 'Route 2 - Noida Sector 62 to Campus', vehicleNumber: 'DL-1CA-5678', allocationDate: '2025-07-15' },
  ],
  notices: [
    { id: 1, title: 'Semester Exams Schedule Released', content: 'The semester exams will begin on June 5th, 2026. The datesheet is available on the portal.', targetRole: 'ALL', publishDate: '2026-05-15', expiryDate: '2026-06-15', status: 'ACTIVE' },
    { id: 2, title: 'Hostel Maintenance Shutdown', content: 'Hot water facilities will be temporarily shut down on May 24th due to annual pipe cleaning.', targetRole: 'STUDENTS', publishDate: '2026-05-18', expiryDate: '2026-05-25', status: 'ACTIVE' },
  ],
  events: [
    { id: 1, title: 'Annual Cultural Fest - Rhythm 2026', description: 'Join us for a two-day celebration of dance, music, drama, and food.', venue: 'Main Auditorium', date: '2026-05-28', time: '10:00 AM', status: 'UPCOMING' },
    { id: 2, title: 'TechSymposium: Future of AI', description: 'A guest lecture series featuring AI research leaders from tech giants.', venue: 'Seminar Hall 3', date: '2026-05-22', time: '02:00 PM', status: 'UPCOMING' },
  ],
  timetable: [
    { id: 1, courseId: 1, courseName: 'B.Tech Computer Science', dayOfWeek: 'MONDAY', startTime: '09:00', endTime: '10:00', subject: 'Data Structures', teacherName: 'John Doe', room: 'Room 101' },
    { id: 2, courseId: 1, courseName: 'B.Tech Computer Science', dayOfWeek: 'MONDAY', startTime: '10:00', endTime: '11:00', subject: 'Algorithms', teacherName: 'Jane Smith', room: 'Room 102' }
  ],
  examSchedules: [
    { id: 1, examName: 'Mid Term Spring', courseId: 1, courseName: 'B.Tech Computer Science', semester: 2, examType: 'MID_TERM', examDate: '2026-03-15', startTime: '10:00', endTime: '13:00', subject: 'Data Structures', room: 'Main Hall' }
  ],
  staffAttendance: [
    { id: 1, employeeId: 1, employeeName: 'John Doe', department: 'Computer Science & Engineering', date: new Date().toISOString().split('T')[0], status: 'PRESENT', remarks: 'On time' }
  ],
  leaveApprovalSteps: [
    { id: 1, leaveRequestId: 1, employeeName: 'Jane Smith', leaveType: 'Sick Leave', startDate: '2026-05-21', endDate: '2026-05-23', status: 'PENDING', reason: 'Flu' }
  ],
  feeInvoices: [
    { id: 1, invoiceNumber: 'INV-2026-001', studentName: 'Amit Sharma', dueDate: '2026-07-01', totalAmount: 50000, paidAmount: 0, status: 'UNPAID' }
  ],
  bookReservations: [
    { id: 1, bookTitle: 'Introduction to Algorithms', borrowerName: 'Rahul Verma', borrowerType: 'STUDENT', reservationDate: '2026-05-20', status: 'PENDING' }
  ],
  users: [
    { id: 1, username: 'EMP001', email: 'emp001@college.edu', fullName: 'John Doe', enabled: true, roles: ['ROLE_ADMIN', 'ROLE_ADMINISTRATOR'], employeeId: 1, employeeCode: 'EMP001' },
    { id: 2, username: 'EMP002', email: 'emp002@college.edu', fullName: 'Sarah Connor', enabled: true, roles: ['ROLE_STAFF'], employeeId: 2, employeeCode: 'EMP002' },
    { id: 3, username: 'EMP003', email: 'emp003@college.edu', fullName: 'Rajesh Kumar', enabled: true, roles: ['ROLE_TEACHER'], employeeId: 3, employeeCode: 'EMP003' }
  ],
  userPermissions: [
    { id: 1, userId: 1, moduleName: 'students', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 2, userId: 1, moduleName: 'employees', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 3, userId: 1, moduleName: 'departments', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 4, userId: 1, moduleName: 'payroll', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 5, userId: 1, moduleName: 'academics', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 6, userId: 1, moduleName: 'library', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 7, userId: 1, moduleName: 'hostel', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 8, userId: 1, moduleName: 'transport', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 9, userId: 1, moduleName: 'finance', canView: true, canCreate: true, canEdit: true, canDelete: true },
    { id: 10, userId: 1, moduleName: 'notices', canView: true, canCreate: true, canEdit: true, canDelete: true },
    
    { id: 11, userId: 2, moduleName: 'students', canView: true, canCreate: false, canEdit: false, canDelete: false },
    { id: 12, userId: 2, moduleName: 'employees', canView: false, canCreate: false, canEdit: false, canDelete: false },
    { id: 13, userId: 2, moduleName: 'library', canView: true, canCreate: true, canEdit: true, canDelete: true }
  ]
};

const DB_KEY = 'erp_mock_db';

const getDB = () => {
  let db = localStorage.getItem(DB_KEY);
  if (!db) {
    db = JSON.stringify(initialDB);
    localStorage.setItem(DB_KEY, db);
  }
  return JSON.parse(db);
};

const saveDB = (db) => {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
};

// Use the real Spring Boot backend datasource instead of the local mock database.
const USE_MOCKS = false;

if (USE_MOCKS) {
  const originalAdapter = axios.defaults.adapter;

  api.defaults.adapter = async (config) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100));

    const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();
  const data = config.data ? JSON.parse(config.data) : null;
  const params = config.params || {};

  const db = getDB();

  const paginatedResponse = (content, page = 0, size = 10) => {
    const start = page * size;
    const end = start + size;
    const paginatedItems = content.slice(start, end);
    return {
      content: paginatedItems,
      totalPages: Math.ceil(content.length / size),
      totalElements: content.length,
      size,
      number: page
    };
  };

  try {
    // AUTHENTICATION
    if (url.includes('/auth/login')) {
      const username = data?.username || 'Admin User';
      return {
        data: {
          accessToken: 'mocked-jwt-token-12345',
          id: 1,
          username: username,
          email: `${username.toLowerCase().replace(/\s+/g, '')}@institution.edu`,
          roles: ['ROLE_ADMIN', 'ROLE_ADMINISTRATOR']
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      };
    }

    // USERS & PERMISSIONS
    if (url.includes('/users/me/permissions')) {
      const perms = db.userPermissions ? db.userPermissions.filter(p => p.userId === 1) : [];
      return { data: perms, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/users\/\d+\/permissions$/)) {
      const userId = parseInt(url.split('/').slice(-2)[0]);
      if (method === 'get') {
        const perms = db.userPermissions ? db.userPermissions.filter(p => p.userId === userId) : [];
        return { data: perms, status: 200, statusText: 'OK', headers: {}, config };
      }
      if (method === 'put') {
        db.userPermissions = (db.userPermissions || []).filter(p => p.userId !== userId);
        const newPerms = (data || []).map((p, idx) => ({
          ...p,
          id: db.userPermissions.length + idx + 1,
          userId
        }));
        db.userPermissions.push(...newPerms);
        saveDB(db);
        return { data: newPerms, status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.match(/\/users\/\d+$/)) {
      const id = parseInt(url.split('/').pop());
      if (method === 'get') {
        const user = db.users ? db.users.find(u => u.id === id) : null;
        return { data: user, status: 200, statusText: 'OK', headers: {}, config };
      }
      if (method === 'put') {
        const idx = db.users.findIndex(u => u.id === id);
        if (idx !== -1) {
          db.users[idx] = { ...db.users[idx], ...data };
          saveDB(db);
          return { data: db.users[idx], status: 200, statusText: 'OK', headers: {}, config };
        }
      }
      if (method === 'delete') {
        db.users = db.users.filter(u => u.id !== id);
        db.userPermissions = db.userPermissions.filter(p => p.userId !== id);
        saveDB(db);
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.endsWith('/users') && method === 'get') {
      return { data: db.users || [], status: 200, statusText: 'OK', headers: {}, config };
    }

    // STUDENTS
    if (url.includes('/students/search')) {
      let filtered = [...db.students];
      if (params.keyword) {
        const k = params.keyword.toLowerCase();
        filtered = filtered.filter(s =>
          s.firstName.toLowerCase().includes(k) ||
          s.lastName.toLowerCase().includes(k) ||
          s.enrollmentNumber.toLowerCase().includes(k)
        );
      }
      if (params.departmentId) {
        const deptIds = params.departmentId.split(',').map(id => parseInt(id));
        filtered = filtered.filter(s => s.department && deptIds.includes(s.department.id));
      }
      if (params.semester) {
        const sems = params.semester.split(',').map(s => parseInt(s));
        filtered = filtered.filter(s => sems.includes(s.currentSemester));
      }
      if (params.status) {
        const statuses = params.status.split(',');
        filtered = filtered.filter(s => statuses.includes(s.status));
      }
      const page = params.page ? parseInt(params.page) : 0;
      const size = params.size ? parseInt(params.size) : 10;
      return { data: paginatedResponse(filtered, page, size), status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/students\/\d+$/) && method === 'delete') {
      const id = parseInt(url.split('/').pop());
      db.students = db.students.filter(s => s.id !== id);
      saveDB(db);
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/students\/\d+$/) && method === 'put') {
      const id = parseInt(url.split('/').pop());
      const idx = db.students.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.students[idx] = { ...db.students[idx], ...data };
        saveDB(db);
        return { data: db.students[idx], status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.endsWith('/students') && method === 'post') {
      const newStudent = {
        ...data,
        id: db.students.length ? Math.max(...db.students.map(s => s.id)) + 1 : 1,
        enrollmentNumber: data.enrollmentNumber || `CSE25${Math.floor(100 + Math.random() * 900)}`
      };
      if (data.departmentId) {
        newStudent.department = db.departments.find(d => d.id === parseInt(data.departmentId)) || null;
      }
      db.students.push(newStudent);
      saveDB(db);
      return { data: newStudent, status: 201, statusText: 'Created', headers: {}, config };
    }

    // TEACHERS
    if (url.includes('/teachers/search') || url.endsWith('/teachers')) {
      let filtered = [...db.teachers];
      if (params.keyword) {
        const k = params.keyword.toLowerCase();
        filtered = filtered.filter(t =>
          t.firstName.toLowerCase().includes(k) ||
          t.lastName.toLowerCase().includes(k) ||
          t.teacherId.toLowerCase().includes(k)
        );
      }
      if (params.departmentId) {
        filtered = filtered.filter(t => t.department && t.department.id === parseInt(params.departmentId));
      }
      const page = params.page ? parseInt(params.page) : 0;
      const size = params.size ? parseInt(params.size) : 10;
      return { data: paginatedResponse(filtered, page, size), status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/teachers\/\d+$/) && method === 'delete') {
      const id = parseInt(url.split('/').pop());
      db.teachers = db.teachers.filter(t => t.id !== id);
      saveDB(db);
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/teachers\/\d+$/) && method === 'put') {
      const id = parseInt(url.split('/').pop());
      const idx = db.teachers.findIndex(t => t.id === id);
      if (idx !== -1) {
        db.teachers[idx] = { ...db.teachers[idx], ...data };
        saveDB(db);
        return { data: db.teachers[idx], status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.endsWith('/teachers') && method === 'post') {
      const newTeacher = {
        ...data,
        id: db.teachers.length ? Math.max(...db.teachers.map(t => t.id)) + 1 : 1,
        teacherId: data.teacherId || `TCH${Math.floor(100 + Math.random() * 900)}`
      };
      db.teachers.push(newTeacher);
      saveDB(db);
      return { data: newTeacher, status: 201, statusText: 'Created', headers: {}, config };
    }

    // DEPARTMENTS
    if (url.includes('/departments/search') || url.endsWith('/departments')) {
      let filtered = [...db.departments];
      if (params.keyword) {
        const k = params.keyword.toLowerCase();
        filtered = filtered.filter(d => d.name.toLowerCase().includes(k) || d.code.toLowerCase().includes(k));
      }
      if (url.includes('/departments/search')) {
        const page = params.page ? parseInt(params.page) : 0;
        const size = params.size ? parseInt(params.size) : 10;
        return { data: paginatedResponse(filtered, page, size), status: 200, statusText: 'OK', headers: {}, config };
      }
      return { data: filtered, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/departments\/\d+$/) && method === 'delete') {
      const id = parseInt(url.split('/').pop());
      db.departments = db.departments.filter(d => d.id !== id);
      saveDB(db);
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/departments\/\d+$/) && method === 'put') {
      const id = parseInt(url.split('/').pop());
      const idx = db.departments.findIndex(d => d.id === id);
      if (idx !== -1) {
        db.departments[idx] = { ...db.departments[idx], ...data };
        saveDB(db);
        return { data: db.departments[idx], status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.endsWith('/departments') && method === 'post') {
      const newDept = {
        ...data,
        id: db.departments.length ? Math.max(...db.departments.map(d => d.id)) + 1 : 1
      };
      db.departments.push(newDept);
      saveDB(db);
      return { data: newDept, status: 201, statusText: 'Created', headers: {}, config };
    }

    // COURSES
    if (url.includes('/courses/search') || url.endsWith('/courses')) {
      let filtered = [...db.courses];
      if (params.keyword) {
        const k = params.keyword.toLowerCase();
        filtered = filtered.filter(c => c.title.toLowerCase().includes(k) || c.courseCode.toLowerCase().includes(k));
      }
      if (url.includes('/courses/search')) {
        const page = params.page ? parseInt(params.page) : 0;
        const size = params.size ? parseInt(params.size) : 10;
        return { data: paginatedResponse(filtered, page, size), status: 200, statusText: 'OK', headers: {}, config };
      }
      return { data: filtered, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/courses\/\d+$/) && method === 'delete') {
      const id = parseInt(url.split('/').pop());
      db.courses = db.courses.filter(c => c.id !== id);
      saveDB(db);
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/courses\/\d+$/) && method === 'put') {
      const id = parseInt(url.split('/').pop());
      const idx = db.courses.findIndex(c => c.id === id);
      if (idx !== -1) {
        db.courses[idx] = { ...db.courses[idx], ...data };
        saveDB(db);
        return { data: db.courses[idx], status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.endsWith('/courses') && method === 'post') {
      const newCourse = {
        ...data,
        id: db.courses.length ? Math.max(...db.courses.map(c => c.id)) + 1 : 1
      };
      if (data.departmentId) {
        newCourse.department = db.departments.find(d => d.id === parseInt(data.departmentId)) || null;
      }
      db.courses.push(newCourse);
      saveDB(db);
      return { data: newCourse, status: 201, statusText: 'Created', headers: {}, config };
    }

    // SUBJECTS
    if (url.includes('/subjects/search') || url.endsWith('/subjects')) {
      let filtered = [...db.subjects];
      if (params.keyword) {
        const k = params.keyword.toLowerCase();
        filtered = filtered.filter(s => s.name.toLowerCase().includes(k) || s.code.toLowerCase().includes(k));
      }
      if (url.includes('/subjects/search')) {
        const page = params.page ? parseInt(params.page) : 0;
        const size = params.size ? parseInt(params.size) : 10;
        return { data: paginatedResponse(filtered, page, size), status: 200, statusText: 'OK', headers: {}, config };
      }
      return { data: filtered, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/subjects\/\d+$/) && method === 'delete') {
      const id = parseInt(url.split('/').pop());
      db.subjects = db.subjects.filter(s => s.id !== id);
      saveDB(db);
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/subjects\/\d+$/) && method === 'put') {
      const id = parseInt(url.split('/').pop());
      const idx = db.subjects.findIndex(s => s.id === id);
      if (idx !== -1) {
        db.subjects[idx] = { ...db.subjects[idx], ...data };
        saveDB(db);
        return { data: db.subjects[idx], status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.endsWith('/subjects') && method === 'post') {
      const newSub = {
        ...data,
        id: db.subjects.length ? Math.max(...db.subjects.map(s => s.id)) + 1 : 1
      };
      db.subjects.push(newSub);
      saveDB(db);
      return { data: newSub, status: 201, statusText: 'Created', headers: {}, config };
    }

    // SEMESTERS & ACADEMIC YEARS
    if (url.includes('/academic-years')) {
      if (method === 'post') {
        const newYear = { ...data, id: db.academicYears.length ? Math.max(...db.academicYears.map(y => y.id)) + 1 : 1 };
        db.academicYears.push(newYear);
        saveDB(db);
        return { data: newYear, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.academicYears, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/semesters')) {
      if (method === 'post') {
        const newSem = { ...data, id: db.semesters.length ? Math.max(...db.semesters.map(s => s.id)) + 1 : 1 };
        db.semesters.push(newSem);
        saveDB(db);
        return { data: newSem, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.semesters, status: 200, statusText: 'OK', headers: {}, config };
    }

    // ATTENDANCE & EXAM RESULTS
    if (url.includes('/attendance')) {
      if (method === 'post') {
        const records = Array.isArray(data) ? data : [data];
        records.forEach(r => {
          const newRec = { ...r, id: db.attendance.length ? Math.max(...db.attendance.map(a => a.id)) + 1 : 1 };
          db.attendance.push(newRec);
        });
        saveDB(db);
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
      }
      let filtered = [...db.attendance];
      if (params.subjectId) {
        filtered = filtered.filter(a => a.subjectId === parseInt(params.subjectId));
      }
      if (params.date) {
        filtered = filtered.filter(a => a.date === params.date);
      }
      return { data: filtered, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/exam-results')) {
      if (method === 'post') {
        const records = Array.isArray(data) ? data : [data];
        records.forEach(r => {
          const newRec = { ...r, id: db.examResults.length ? Math.max(...db.examResults.map(e => e.id)) + 1 : 1 };
          db.examResults.push(newRec);
        });
        saveDB(db);
        return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
      }
      let filtered = [...db.examResults];
      if (params.subjectId) {
        filtered = filtered.filter(e => e.subjectId === parseInt(params.subjectId));
      }
      if (params.studentId) {
        filtered = filtered.filter(e => e.studentId === parseInt(params.studentId));
      }
      return { data: filtered, status: 200, statusText: 'OK', headers: {}, config };
    }

    // EMPLOYEES & LEAVES & PAYROLL
    if (url.includes('/employees/search') || (url.endsWith('/employees') && method === 'get')) {
      let filtered = [...db.employees];
      const deptFilter = params.departmentId || params.department;
      if (deptFilter) {
        const depts = deptFilter.split(',');
        filtered = filtered.filter(e => e.department && depts.includes(e.department.id?.toString()));
      }
      if (params.role) {
        const roles = params.role.split(',');
        filtered = filtered.filter(e => roles.includes(e.role));
      }
      if (params.status) {
        const statuses = params.status.split(',');
        filtered = filtered.filter(e => statuses.includes(e.status));
      }
      if (params.keyword) {
        const k = params.keyword.toLowerCase();
        filtered = filtered.filter(e =>
          e.firstName.toLowerCase().includes(k) ||
          e.lastName.toLowerCase().includes(k) ||
          (e.employeeId && e.employeeId.toLowerCase().includes(k))
        );
      }
      const page = params.page ? parseInt(params.page) : 0;
      const size = params.size ? parseInt(params.size) : 10;
      if (url.includes('/search')) {
        return { data: paginatedResponse(filtered, page, size), status: 200, statusText: 'OK', headers: {}, config };
      }
      return { data: filtered, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/employees\/\d+$/) && method === 'delete') {
      const id = parseInt(url.split('/').pop());
      db.employees = db.employees.filter(e => e.id !== id);
      saveDB(db);
      return { data: { success: true }, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/employees\/\d+$/) && method === 'put') {
      const id = parseInt(url.split('/').pop());
      const idx = db.employees.findIndex(e => e.id === id);
      if (idx !== -1) {
        const updatedEmployee = { ...db.employees[idx], ...data };
        if (data.department?.id) {
          updatedEmployee.department = db.departments.find(d => d.id === parseInt(data.department.id)) || updatedEmployee.department;
        }
        if (data.departmentId) {
          updatedEmployee.department = db.departments.find(d => d.id === parseInt(data.departmentId)) || updatedEmployee.department;
        }
        db.employees[idx] = updatedEmployee;
        saveDB(db);
        return { data: db.employees[idx], status: 200, statusText: 'OK', headers: {}, config };
      }
    }

    if (url.endsWith('/employees') && method === 'post') {
      const newEmp = {
        ...data,
        id: db.employees.length ? Math.max(...db.employees.map(e => e.id)) + 1 : 1,
        employeeId: data.employeeId || `EMP${Math.floor(100 + Math.random() * 900)}`
      };
      if (data.department?.id) {
        newEmp.department = db.departments.find(d => d.id === parseInt(data.department.id)) || null;
      }
      if (data.departmentId && !newEmp.department) {
        newEmp.department = db.departments.find(d => d.id === parseInt(data.departmentId)) || null;
      }
      const officialEmail = newEmp.employeeId.toLowerCase() + "@college.edu";
      newEmp.email = officialEmail;
      
      db.employees.push(newEmp);

      // Auto-create User account in mock DB
      const newUser = {
        id: db.users && db.users.length ? Math.max(...db.users.map(u => u.id)) + 1 : 1,
        username: newEmp.employeeId,
        email: officialEmail,
        fullName: `${newEmp.firstName} ${newEmp.lastName}`,
        enabled: true,
        roles: [newEmp.employeeType === 'ADMIN' ? 'ROLE_ADMIN' : 'ROLE_STAFF'],
        employeeId: newEmp.id,
        employeeCode: newEmp.employeeId
      };
      if (!db.users) db.users = [];
      db.users.push(newUser);

      // Initialize mock User Permissions for all modules (defaulting to false)
      const modules = ['students', 'employees', 'departments', 'payroll', 'academics', 'library', 'hostel', 'transport', 'finance', 'notices'];
      if (!db.userPermissions) db.userPermissions = [];
      modules.forEach((mod, idx) => {
        db.userPermissions.push({
          id: db.userPermissions.length + 1,
          userId: newUser.id,
          moduleName: mod,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false
        });
      });

      saveDB(db);
      return { data: newEmp, status: 201, statusText: 'Created', headers: {}, config };
    }

    if (url.includes('/leaves')) {
      if (method === 'post') {
        const newLeave = {
          ...data,
          id: db.leaves.length ? Math.max(...db.leaves.map(l => l.id)) + 1 : 1,
          status: 'PENDING'
        };
        if (data.employeeId) {
          newLeave.employee = db.employees.find(e => e.id === parseInt(data.employeeId)) || null;
        }
        db.leaves.push(newLeave);
        saveDB(db);
        return { data: newLeave, status: 201, statusText: 'Created', headers: {}, config };
      }
      if (url.match(/\/leaves\/\d+\/(approve|reject)$/)) {
        const parts = url.split('/');
        const status = parts.pop().toUpperCase() === 'APPROVE' ? 'APPROVED' : 'REJECTED';
        const id = parseInt(parts.pop());
        const idx = db.leaves.findIndex(l => l.id === id);
        if (idx !== -1) {
          db.leaves[idx].status = status;
          saveDB(db);
          return { data: db.leaves[idx], status: 200, statusText: 'OK', headers: {}, config };
        }
      }
      return { data: db.leaves, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/payroll')) {
      if (method === 'post') {
        const newPayroll = {
          ...data,
          id: db.payroll.length ? Math.max(...db.payroll.map(p => p.id)) + 1 : 1,
          status: 'PENDING'
        };
        if (data.employeeId) {
          newPayroll.employee = db.employees.find(e => e.id === parseInt(data.employeeId)) || null;
        }
        db.payroll.push(newPayroll);
        saveDB(db);
        return { data: newPayroll, status: 201, statusText: 'Created', headers: {}, config };
      }
      if (url.match(/\/payroll\/\d+\/pay$/)) {
        const parts = url.split('/');
        const id = parseInt(parts[parts.length - 2]);
        const idx = db.payroll.findIndex(p => p.id === id);
        if (idx !== -1) {
          db.payroll[idx].status = 'PAID';
          saveDB(db);
          return { data: db.payroll[idx], status: 200, statusText: 'OK', headers: {}, config };
        }
      }
      return { data: db.payroll, status: 200, statusText: 'OK', headers: {}, config };
    }

    // FEES & SCHOLARSHIPS
    if (url.includes('/fees')) {
      if (url.includes('/total-collected')) {
        const total = db.fees.filter(f => f.status === 'PAID').reduce((sum, f) => sum + f.amount, 0);
        return { data: total, status: 200, statusText: 'OK', headers: {}, config };
      }
      if (method === 'post') {
        const newFee = {
          ...data,
          id: db.fees.length ? Math.max(...db.fees.map(f => f.id)) + 1 : 1,
          status: 'UNPAID',
          transactionId: ''
        };
        if (data.studentId) {
          newFee.student = db.students.find(s => s.id === parseInt(data.studentId)) || null;
        }
        db.fees.push(newFee);
        saveDB(db);
        return { data: newFee, status: 201, statusText: 'Created', headers: {}, config };
      }
      if (url.match(/\/fees\/\d+\/pay$/)) {
        const parts = url.split('/');
        const id = parseInt(parts[parts.length - 2]);
        const idx = db.fees.findIndex(f => f.id === id);
        if (idx !== -1) {
          db.fees[idx].status = 'PAID';
          db.fees[idx].transactionId = `TXN${Math.floor(10000000 + Math.random() * 90000000)}`;
          saveDB(db);
          return { data: db.fees[idx], status: 200, statusText: 'OK', headers: {}, config };
        }
      }
      return { data: db.fees, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/admissions/search') || (url.endsWith('/admissions') && method === 'get')) {
      let filtered = [...db.admissions];
      if (params.studentId) {
        filtered = filtered.filter(a => a.student && a.student.id === parseInt(params.studentId));
      }
      if (params.courseId) {
        filtered = filtered.filter(a => a.course && a.course.id === parseInt(params.courseId));
      }
      if (params.departmentId) {
        filtered = filtered.filter(a => a.department && a.department.id === parseInt(params.departmentId));
      }
      if (params.status) {
        const statuses = params.status.split(',');
        filtered = filtered.filter(a => statuses.includes(a.status));
      }
      if (params.keyword) {
        const k = params.keyword.toLowerCase();
        filtered = filtered.filter(a =>
          a.admissionNumber?.toLowerCase().includes(k) ||
          a.billNumber?.toLowerCase().includes(k) ||
          a.student?.firstName?.toLowerCase().includes(k) ||
          a.student?.lastName?.toLowerCase().includes(k) ||
          a.course?.title?.toLowerCase().includes(k)
        );
      }
      const page = params.page ? parseInt(params.page) : 0;
      const size = params.size ? parseInt(params.size) : 10;
      if (url.includes('/search')) {
        return { data: paginatedResponse(filtered, page, size), status: 200, statusText: 'OK', headers: {}, config };
      }
      return { data: filtered, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.match(/\/admissions\/\d+$/) && method === 'get') {
      const id = parseInt(url.split('/').pop());
      const admission = db.admissions.find(a => a.id === id);
      return { data: admission || null, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.endsWith('/admissions') && method === 'post') {
      const newAdmission = {
        ...data,
        id: db.admissions.length ? Math.max(...db.admissions.map(a => a.id)) + 1 : 1,
        admissionNumber: data.admissionNumber || `ADM${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        billNumber: data.billNumber || `BILL-${Math.floor(100000 + Math.random() * 900000)}`,
        admissionDate: data.admissionDate || new Date().toISOString().split('T')[0],
        status: data.status || 'ACTIVE'
      };
      newAdmission.student = data.student?.id ? db.students.find(s => s.id === parseInt(data.student.id)) || { id: parseInt(data.student.id) } : null;
      newAdmission.course = data.course?.id ? db.courses.find(c => c.id === parseInt(data.course.id)) || { id: parseInt(data.course.id) } : null;
      newAdmission.department = data.department?.id ? db.departments.find(d => d.id === parseInt(data.department.id)) || newAdmission.course?.department || null : newAdmission.course?.department || null;
      const totalFee = parseFloat(data.totalFeeAmount || 0);
      const discount = parseFloat(data.discountAmount || 0) || 0;
      const netPayable = totalFee - discount;
      const amountPaid = parseFloat(data.amountPaid || 0) || 0;
      newAdmission.totalFeeAmount = totalFee;
      newAdmission.discountAmount = discount;
      newAdmission.netPayableAmount = netPayable;
      newAdmission.amountPaid = amountPaid;
      newAdmission.balanceDue = Math.max(0, netPayable - amountPaid);
      db.admissions.push(newAdmission);
      saveDB(db);
      return { data: newAdmission, status: 201, statusText: 'Created', headers: {}, config };
    }

    if (url.includes('/scholarships')) {
      if (method === 'post') {
        const newScholarship = {
          ...data,
          id: db.scholarships.length ? Math.max(...db.scholarships.map(s => s.id)) + 1 : 1
        };
        db.scholarships.push(newScholarship);
        saveDB(db);
        return { data: newScholarship, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.scholarships, status: 200, statusText: 'OK', headers: {}, config };
    }

    // LIBRARY, HOSTEL, TRANSPORT
    if (url.includes('/library/books')) {
      if (method === 'post') {
        const newBook = { ...data, id: db.books.length ? Math.max(...db.books.map(b => b.id)) + 1 : 1, availableCopies: data.totalCopies || 1, status: 'AVAILABLE' };
        db.books.push(newBook);
        saveDB(db);
        return { data: newBook, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.books, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (url.includes('/library/issues/overdue')) {
      return { data: db.overdueIssues, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/hostel/rooms')) {
      if (method === 'post') {
        const newRoom = { ...data, id: db.rooms.length ? Math.max(...db.rooms.map(r => r.id)) + 1 : 1, currentOccupants: 0, status: 'AVAILABLE' };
        db.rooms.push(newRoom);
        saveDB(db);
        return { data: newRoom, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.rooms, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (url.includes('/hostel/allocations')) {
      if (method === 'post') {
        const student = db.students.find(s => s.id === parseInt(data.studentId));
        const room = db.rooms.find(r => r.id === parseInt(data.roomId));
        if (room) {
          room.currentOccupants = Math.min(room.capacity, room.currentOccupants + 1);
          if (room.currentOccupants === room.capacity) room.status = 'FULL';
          const newAlloc = {
            id: db.hostelAllocations.length ? Math.max(...db.hostelAllocations.map(a => a.id)) + 1 : 1,
            student,
            hostelName: room.hostelName,
            roomNumber: room.roomNumber,
            allocationDate: new Date().toISOString().split('T')[0]
          };
          db.hostelAllocations.push(newAlloc);
          saveDB(db);
          return { data: newAlloc, status: 201, statusText: 'Created', headers: {}, config };
        }
      }
      return { data: db.hostelAllocations, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/transport/vehicles')) {
      if (method === 'post') {
        const newV = { ...data, id: db.vehicles.length ? Math.max(...db.vehicles.map(v => v.id)) + 1 : 1 };
        db.vehicles.push(newV);
        saveDB(db);
        return { data: newV, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.vehicles, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (url.includes('/transport/routes')) {
      if (method === 'post') {
        const newR = { ...data, id: db.routes.length ? Math.max(...db.routes.map(r => r.id)) + 1 : 1 };
        db.routes.push(newR);
        saveDB(db);
        return { data: newR, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.routes, status: 200, statusText: 'OK', headers: {}, config };
    }
    if (url.includes('/transport/allocations')) {
      if (method === 'post') {
        const student = db.students.find(s => s.id === parseInt(data.studentId));
        const route = db.routes.find(r => r.id === parseInt(data.routeId));
        const newAlloc = {
          id: db.transportAllocations.length ? Math.max(...db.transportAllocations.map(a => a.id)) + 1 : 1,
          student,
          routeName: route.routeName,
          vehicleNumber: route.vehicleNumber,
          allocationDate: new Date().toISOString().split('T')[0]
        };
        db.transportAllocations.push(newAlloc);
        saveDB(db);
        return { data: newAlloc, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.transportAllocations, status: 200, statusText: 'OK', headers: {}, config };
    }

    // NOTICES & EVENTS
    if (url.includes('/notices')) {
      if (method === 'post') {
        const newN = { ...data, id: db.notices.length ? Math.max(...db.notices.map(n => n.id)) + 1 : 1, publishDate: new Date().toISOString().split('T')[0], status: 'ACTIVE' };
        db.notices.push(newN);
        saveDB(db);
        return { data: newN, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.notices, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/events')) {
      if (method === 'post') {
        const newE = { ...data, id: db.events.length ? Math.max(...db.events.map(e => e.id)) + 1 : 1, status: 'UPCOMING' };
        db.events.push(newE);
        saveDB(db);
        return { data: newE, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.events, status: 200, statusText: 'OK', headers: {}, config };
    }

    // REPORTS
    if (url.includes('/reports')) {
      const type = params.reportType;
      let content = [];
      if (type === 'Student Attendance Report') {
        content = db.attendance.map(a => ({
          studentName: a.studentName,
          enrollmentNumber: a.enrollmentNumber,
          subjectName: a.subjectName,
          date: a.date,
          status: a.status
        }));
      } else if (type === 'Fee Collection Report') {
        content = db.fees.map(f => ({
          studentName: f.student ? `${f.student.firstName} ${f.student.lastName}` : 'N/A',
          enrollmentNumber: f.student ? f.student.enrollmentNumber : 'N/A',
          feeType: f.feeType,
          amount: f.amount,
          status: f.status,
          transactionId: f.transactionId || 'N/A'
        }));
      } else if (type === 'Salary Disbursement Report') {
        content = db.payroll.map(p => ({
          employeeName: p.employee ? `${p.employee.firstName} ${p.employee.lastName}` : 'N/A',
          month: p.month,
          year: p.year,
          netSalary: p.netSalary,
          status: p.status
        }));
      } else {
        content = [
          { item: 'Total Students', value: db.students.length },
          { item: 'Total Staff', value: db.employees.length },
          { item: 'Total Active Courses', value: db.courses.length },
          { item: 'Total Active Notices', value: db.notices.length }
        ];
      }
      return { data: content, status: 200, statusText: 'OK', headers: {}, config };
    }

    // NEW FEATURE MODULES
    if (url.includes('/academics/timetable')) {
      if (method === 'post') {
        const newObj = { ...data, id: db.timetable.length ? Math.max(...db.timetable.map(e => e.id)) + 1 : 1, courseName: 'Assigned Course', teacherName: 'Assigned Teacher' };
        db.timetable.push(newObj);
        saveDB(db);
        return { data: newObj, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.timetable, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/academic-features/exam-schedules')) {
      if (method === 'post') {
        const newObj = { ...data, id: db.examSchedules.length ? Math.max(...db.examSchedules.map(e => e.id)) + 1 : 1, courseName: 'Assigned Course' };
        db.examSchedules.push(newObj);
        saveDB(db);
        return { data: newObj, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.examSchedules, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/hr/attendance')) {
      if (method === 'post') {
        const newObj = { ...data, id: db.staffAttendance.length ? Math.max(...db.staffAttendance.map(e => e.id)) + 1 : 1, employeeName: 'Recorded Staff', department: 'Recorded Dept' };
        db.staffAttendance.push(newObj);
        saveDB(db);
        return { data: newObj, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.staffAttendance, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/hr/leave-approval-steps')) {
      if (method === 'patch') {
        const parts = url.split('?')[0].split('/');
        const id = parseInt(parts[parts.length - 1]);
        const idx = db.leaveApprovalSteps.findIndex(p => p.id === id);
        if (idx !== -1) {
          db.leaveApprovalSteps[idx].status = params.status || 'APPROVED';
          saveDB(db);
          return { data: db.leaveApprovalSteps[idx], status: 200, statusText: 'OK', headers: {}, config };
        }
      }
      return { data: db.leaveApprovalSteps, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/finance/invoices')) {
      if (url.includes('/payments') && method === 'post') {
        const parts = url.split('/');
        const id = parseInt(parts[parts.length - 2]);
        const idx = db.feeInvoices.findIndex(p => p.id === id);
        if (idx !== -1) {
          db.feeInvoices[idx].paidAmount += data.amount;
          db.feeInvoices[idx].status = db.feeInvoices[idx].paidAmount >= db.feeInvoices[idx].totalAmount ? 'PAID' : 'PARTIAL';
          saveDB(db);
          return { data: db.feeInvoices[idx], status: 200, statusText: 'OK', headers: {}, config };
        }
      }
      return { data: db.feeInvoices, status: 200, statusText: 'OK', headers: {}, config };
    }

    if (url.includes('/library/features/reservations')) {
      if (method === 'post') {
        const newObj = { ...data, id: db.bookReservations.length ? Math.max(...db.bookReservations.map(e => e.id)) + 1 : 1, borrowerType: 'STUDENT', reservationDate: new Date().toISOString().split('T')[0], status: 'PENDING' };
        db.bookReservations.push(newObj);
        saveDB(db);
        return { data: newObj, status: 201, statusText: 'Created', headers: {}, config };
      }
      return { data: db.bookReservations, status: 200, statusText: 'OK', headers: {}, config };
    }

    return { data: [], status: 200, statusText: 'OK', headers: {}, config };

  } catch (err) {
    console.error('Mock Adapter Error:', err);
    return { data: [], status: 500, statusText: 'Internal Server Error', headers: {}, config };
  }
  };
}

export default api;
