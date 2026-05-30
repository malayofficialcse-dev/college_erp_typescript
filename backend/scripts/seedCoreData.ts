import "dotenv/config";
import mongoose, { type Model } from "mongoose";

import AcademicYear from "../Models/Core/AcademicYear.ts";
import Admission from "../Models/Core/Admission.ts";
import AdmissionEmi from "../Models/Core/AdmissionEmi.ts";
import Attendance from "../Models/Core/Attendance.ts";
import Classroom from "../Models/Core/Classroom.ts";
import Counseling from "../Models/Core/Counseling.ts";
import Course from "../Models/Core/Courses.ts";
import Department from "../Models/Core/Department.ts";
import ExamResult from "../Models/Core/ExamResult.ts";
import ExamSchedule from "../Models/Core/ExamSchedule.ts";
import Section from "../Models/Core/Section.ts";
import Semester from "../Models/Core/Semester.ts";
import Session from "../Models/Core/Session.ts";
import Student from "../Models/Core/Student.ts";
import Subject from "../Models/Core/Subject.ts";
import SubjectAssignment from "../Models/Core/SubjectAssignment.ts";
import Teacher from "../Models/Core/Teacher.ts";
import Timetable from "../Models/Core/Timetable.ts";

type AnyRecord = Record<string, any>;

const COUNT = 10;
const mongoUri =
  process.env.MONGO_URI_ATLAS ??
  process.env.MONGO_URI ??
  "mongodb://localhost:27017/erp";

const names = [
  ["Aarav", "Sharma"],
  ["Isha", "Patel"],
  ["Rohan", "Mehta"],
  ["Ananya", "Rao"],
  ["Kabir", "Singh"],
  ["Mira", "Nair"],
  ["Vivaan", "Gupta"],
  ["Tara", "Das"],
  ["Arjun", "Iyer"],
  ["Diya", "Khan"],
];

const departments = [
  ["Computer Science", "CSE", "Dr. Neha Verma"],
  ["Information Technology", "IT", "Dr. Vikram Sinha"],
  ["Electronics Engineering", "ECE", "Dr. Ritu Kapoor"],
  ["Mechanical Engineering", "ME", "Dr. Suresh Menon"],
  ["Civil Engineering", "CE", "Dr. Anil Desai"],
  ["Electrical Engineering", "EE", "Dr. Pooja Shah"],
  ["Business Administration", "BBA", "Dr. Kavita Joshi"],
  ["Commerce", "COM", "Dr. Manish Agarwal"],
  ["Mathematics", "MATH", "Dr. Farah Ali"],
  ["Physics", "PHY", "Dr. Rajat Bose"],
];

const subjects = [
  ["Programming Fundamentals", "PF"],
  ["Database Management Systems", "DBMS"],
  ["Digital Electronics", "DE"],
  ["Thermodynamics", "TD"],
  ["Structural Analysis", "SA"],
  ["Power Systems", "PS"],
  ["Principles of Management", "POM"],
  ["Financial Accounting", "FA"],
  ["Linear Algebra", "LA"],
  ["Quantum Mechanics", "QM"],
];

const paymentMethods = ["CASH", "UPI", "BANK_TRANSFER", "CHEQUE", "CARD", "DD"];
const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

const date = (value: string) => new Date(`${value}T00:00:00.000Z`);

const upsertOne = async <T extends AnyRecord>(
  model: Model<any>,
  filter: AnyRecord,
  data: T
) => {
  const document = await model.findOneAndUpdate(filter, data, {
    returnDocument: "after",
    runValidators: true,
    setDefaultsOnInsert: true,
    upsert: true,
  });

  if (!document) {
    throw new Error(`Unable to seed ${model.modelName}`);
  }

  return document;
};

const seedCoreData = async () => {
  await mongoose.connect(mongoUri);
  console.log(`Connected to ${mongoose.connection.name}`);

  const academicYears = [];
  for (let index = 0; index < COUNT; index += 1) {
    const startYear = 2020 + index;
    academicYears.push(
      await upsertOne(
        AcademicYear,
        { code: `AY${startYear}${startYear + 1}` },
        {
          name: `${startYear}-${startYear + 1}`,
          code: `AY${startYear}${startYear + 1}`,
          startDate: date(`${startYear}-07-01`),
          endDate: date(`${startYear + 1}-06-30`),
          isActive: index === COUNT - 1,
        }
      )
    );
  }

  const departmentDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const [name, code, hodName] = departments[index];
    departmentDocs.push(
      await upsertOne(
        Department,
        { code },
        {
          name,
          code,
          description: `${name} department for core ERP sample data.`,
          estdYear: String(1995 + index),
          hodName,
          email: `${code.toLowerCase()}@college.example`,
          phone: `98765000${String(index + 1).padStart(2, "0")}`,
          isActive: true,
        }
      )
    );
  }

  const courseDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const department = departmentDocs[index];
    const code = `CRS${String(index + 1).padStart(2, "0")}`;
    courseDocs.push(
      await upsertOne(
        Course,
        { code },
        {
          name: `${departments[index][0]} Program`,
          code,
          duration: index < 8 ? "4 Years" : "2 Years",
          durationYears: index < 8 ? 4 : 2,
          totalSemesters: index < 8 ? 8 : 4,
          credits: 120 + index * 4,
          fees: 45000 + index * 5000,
          courseType: index < 6 ? "UNDERGRADUATE" : index < 8 ? "POSTGRADUATE" : "DIPLOMA",
          status: "ACTIVE",
          department: department._id,
          description: `Sample course connected to ${department.name}.`,
          isActive: true,
        }
      )
    );
  }

  const sessionDocs = [];
  const semesterDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const academicYear = academicYears[index];
    const startYear = 2020 + index;
    sessionDocs.push(
      await upsertOne(
        Session,
        { label: `Session ${startYear}-${startYear + 1}` },
        {
          label: `Session ${startYear}-${startYear + 1}`,
          academicYear: academicYear._id,
          startDate: date(`${startYear}-07-01`),
          endDate: date(`${startYear + 1}-06-30`),
          isActive: index === COUNT - 1,
        }
      )
    );

    semesterDocs.push(
      await upsertOne(
        Semester,
        { academicYear: academicYear._id, semesterNumber: index + 1 },
        {
          name: `Semester ${index + 1}`,
          semesterNumber: index + 1,
          academicYear: academicYear._id,
          course: courseDocs[index]._id,
          startDate: date(`${startYear}-07-01`),
          endDate: date(`${startYear}-12-31`),
          isActive: index === COUNT - 1,
        }
      )
    );
  }

  const teacherDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const [firstName, lastName] = names[(index + 3) % names.length];
    const employeeCode = `TCH${String(index + 1).padStart(3, "0")}`;
    teacherDocs.push(
      await upsertOne(
        Teacher,
        { employeeCode },
        {
          employeeCode,
          firstName,
          lastName,
          email: `${firstName}.${lastName}.teacher@college.example`.toLowerCase(),
          phone: `99887000${String(index + 1).padStart(2, "0")}`,
          designation: index % 3 === 0 ? "Professor" : index % 3 === 1 ? "Associate Professor" : "Assistant Professor",
          qualification: index % 2 === 0 ? "PhD" : "M.Tech",
          joiningDate: date(`${2012 + index}-06-15`),
          department: departmentDocs[index]._id,
          status: "ACTIVE",
        }
      )
    );
  }

  const classroomDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const roomNumber = `A-${String(101 + index)}`;
    classroomDocs.push(
      await upsertOne(
        Classroom,
        { building: "Academic Block", roomNumber },
        {
          roomNumber,
          building: "Academic Block",
          floor: Math.floor(index / 3),
          capacity: 40 + index * 5,
          roomType: index % 4 === 0 ? "LAB" : index % 4 === 1 ? "LECTURE" : index % 4 === 2 ? "SEMINAR" : "AUDITORIUM",
          isActive: true,
        }
      )
    );
  }

  const sectionDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const code = `SEC${String(index + 1).padStart(2, "0")}`;
    sectionDocs.push(
      await upsertOne(
        Section,
        { code },
        {
          name: `Section ${String.fromCharCode(65 + index)}`,
          code,
          department: departmentDocs[index]._id,
          course: courseDocs[index]._id,
          semester: semesterDocs[index]._id,
          academicYear: academicYears[index]._id,
          capacity: 50 + index,
          classTeacher: teacherDocs[index]._id,
          isActive: true,
        }
      )
    );
  }

  const studentDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const [firstName, lastName] = names[index];
    const enrollmentNumber = `ERPSTU${String(index + 1).padStart(4, "0")}`;
    studentDocs.push(
      await upsertOne(
        Student,
        { enrollmentNumber },
        {
          enrollmentNumber,
          firstName,
          lastName,
          email: `${firstName}.${lastName}.student@college.example`.toLowerCase(),
          phone: `90909000${String(index + 1).padStart(2, "0")}`,
          gender: index % 3 === 0 ? "Female" : index % 3 === 1 ? "Male" : "Other",
          dateOfBirth: date(`${2003 + (index % 3)}-${String((index % 9) + 1).padStart(2, "0")}-15`),
          guardianName: `${lastName} Guardian`,
          guardianPhone: `91919100${String(index + 1).padStart(2, "0")}`,
          address: `${index + 11}, Knowledge Park, City ${index + 1}`,
          department: departmentDocs[index]._id,
          course: courseDocs[index]._id,
          section: sectionDocs[index]._id,
          academicYear: academicYears[index]._id,
          currentSemester: index + 1,
          status: "ACTIVE",
        }
      )
    );
  }

  const subjectDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const [subjectName, code] = subjects[index];
    subjectDocs.push(
      await upsertOne(
        Subject,
        { subjectCode: `${code}${String(index + 1).padStart(2, "0")}` },
        {
          subjectCode: `${code}${String(index + 1).padStart(2, "0")}`,
          subjectName,
          description: `${subjectName} sample subject linked to ${courseDocs[index].name}.`,
          department: departmentDocs[index]._id,
          course: courseDocs[index]._id,
          semester: semesterDocs[index]._id,
          teacher: teacherDocs[index]._id,
          semesterNumber: index + 1,
          credits: 3 + (index % 3),
          subjectType: index % 3 === 0 ? "Theory" : index % 3 === 1 ? "Practical" : "Lab",
          totalMarks: 100,
          passingMarks: 40,
          isActive: true,
        }
      )
    );
  }

  const admissionDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    const admissionNumber = `ADM${String(index + 1).padStart(4, "0")}`;
    const totalFeeAmount = courseDocs[index].fees;
    const discountAmount = index * 500;
    const netPayableAmount = totalFeeAmount - discountAmount;
    const amountPaid = Math.floor(netPayableAmount * 0.4);
    admissionDocs.push(
      await upsertOne(
        Admission,
        { admissionNumber },
        {
          admissionNumber,
          billNumber: `BILL${String(index + 1).padStart(4, "0")}`,
          student: studentDocs[index]._id,
          course: courseDocs[index]._id,
          department: departmentDocs[index]._id,
          academicYear: academicYears[index]._id,
          admissionDate: date(`2024-${String((index % 9) + 1).padStart(2, "0")}-10`),
          totalFeeAmount,
          discountAmount,
          netPayableAmount,
          amountPaid,
          balanceDue: netPayableAmount - amountPaid,
          advanceAmount: 5000 + index * 1000,
          advancePaymentDate: date(`2024-${String((index % 9) + 1).padStart(2, "0")}-12`),
          advancePaymentMethod: paymentMethods[index % paymentMethods.length],
          advanceTransactionId: `ADVTXN${String(index + 1).padStart(4, "0")}`,
          advanceChequeDetails: {
            bankName: "State Bank of India",
            holderName: `${studentDocs[index].firstName} ${studentDocs[index].lastName}`,
            chequeNumber: `CHQ${String(index + 1).padStart(6, "0")}`,
            chequeDate: date(`2024-${String((index % 9) + 1).padStart(2, "0")}-11`),
          },
          advanceBankTransferDetails: {
            bankName: "HDFC Bank",
            accountHolder: `${studentDocs[index].firstName} ${studentDocs[index].lastName}`,
            accountNumber: `5010000000${String(index + 1).padStart(2, "0")}`,
            ifscCode: "HDFC0001234",
          },
          paymentPlan: "EMI",
          numberOfEmis: 4,
          status: index % 2 === 0 ? "ACTIVE" : "PENDING",
          remarks: "Seed admission with related student, course, department, and academic year.",
        }
      )
    );
  }

  const examScheduleDocs = [];
  for (let index = 0; index < COUNT; index += 1) {
    examScheduleDocs.push(
      await upsertOne(
        ExamSchedule,
        { examName: `Core Mid Term ${index + 1}`, course: courseDocs[index]._id },
        {
          examName: `Core Mid Term ${index + 1}`,
          course: courseDocs[index]._id,
          subject: subjectDocs[index]._id,
          semester: semesterDocs[index]._id,
          semesterNumber: index + 1,
          examType: index % 4 === 0 ? "MID_TERM" : index % 4 === 1 ? "FINAL" : index % 4 === 2 ? "PRACTICAL" : "VIVA",
          examDate: date(`2025-${String((index % 9) + 1).padStart(2, "0")}-20`),
          startTime: "10:00",
          endTime: "12:00",
          classroom: classroomDocs[index]._id,
          status: index % 3 === 0 ? "COMPLETED" : "SCHEDULED",
        }
      )
    );
  }

  for (let index = 0; index < COUNT; index += 1) {
    await upsertOne(
      AdmissionEmi,
      { admission: admissionDocs[index]._id, emiNumber: 1 },
      {
        admission: admissionDocs[index]._id,
        emiNumber: 1,
        emiAmount: Math.floor(admissionDocs[index].netPayableAmount / 4),
        dueDate: date(`2025-${String((index % 9) + 1).padStart(2, "0")}-05`),
        paidAmount: index % 2 === 0 ? Math.floor(admissionDocs[index].netPayableAmount / 4) : 0,
        paidDate: index % 2 === 0 ? date(`2025-${String((index % 9) + 1).padStart(2, "0")}-03`) : undefined,
        fineAmount: index % 2 === 0 ? 0 : 250,
        semester: index + 1,
        paymentMethod: paymentMethods[index % paymentMethods.length],
        transactionId: `EMITXN${String(index + 1).padStart(4, "0")}`,
        receiptNumber: `RCPT${String(index + 1).padStart(4, "0")}`,
        status: index % 2 === 0 ? "PAID" : "PENDING",
        remarks: "Seed EMI linked to seeded admission.",
        carryOverAmount: index % 2 === 0 ? 0 : 500,
        chequeDetails: {
          bankName: "Axis Bank",
          holderName: `${studentDocs[index].firstName} ${studentDocs[index].lastName}`,
          chequeNumber: `EMICHQ${String(index + 1).padStart(5, "0")}`,
          chequeDate: date(`2025-${String((index % 9) + 1).padStart(2, "0")}-01`),
        },
        bankTransferDetails: {
          bankName: "ICICI Bank",
          accountHolder: `${studentDocs[index].firstName} ${studentDocs[index].lastName}`,
          accountNumber: `7010000000${String(index + 1).padStart(2, "0")}`,
          ifscCode: "ICIC0001234",
        },
      }
    );

    await upsertOne(
      Attendance,
      { student: studentDocs[index]._id, subject: subjectDocs[index]._id, date: date(`2025-02-${String(index + 1).padStart(2, "0")}`) },
      {
        student: studentDocs[index]._id,
        subject: subjectDocs[index]._id,
        date: date(`2025-02-${String(index + 1).padStart(2, "0")}`),
        status: index % 4 === 0 ? "ABSENT" : index % 4 === 1 ? "LATE" : index % 4 === 2 ? "EXCUSED" : "PRESENT",
        remarks: "Seed attendance linked to student, subject, and teacher.",
        markedBy: teacherDocs[index]._id,
      }
    );

    await upsertOne(
      ExamResult,
      { student: studentDocs[index]._id, subject: subjectDocs[index]._id, examType: "MID_TERM" },
      {
        student: studentDocs[index]._id,
        subject: subjectDocs[index]._id,
        examSchedule: examScheduleDocs[index]._id,
        examType: "MID_TERM",
        marksObtained: 55 + index * 4,
        maxMarks: 100,
        grade: index > 7 ? "A" : index > 4 ? "B" : "C",
        gradePoint: index > 7 ? 9 : index > 4 ? 8 : 7,
        resultStatus: "PASS",
        semesterNumber: index + 1,
        remarks: "Seed result linked to exam schedule.",
      }
    );

    await upsertOne(
      Timetable,
      { course: courseDocs[index]._id, dayOfWeek: days[index % days.length], startTime: `${String(9 + (index % 4)).padStart(2, "0")}:00`, classroom: classroomDocs[index]._id },
      {
        course: courseDocs[index]._id,
        subject: subjectDocs[index]._id,
        teacher: teacherDocs[index]._id,
        classroom: classroomDocs[index]._id,
        semester: semesterDocs[index]._id,
        section: sectionDocs[index]._id,
        dayOfWeek: days[index % days.length],
        startTime: `${String(9 + (index % 4)).padStart(2, "0")}:00`,
        endTime: `${String(10 + (index % 4)).padStart(2, "0")}:00`,
        isActive: true,
      }
    );

    await upsertOne(
      SubjectAssignment,
      { teacher: teacherDocs[index]._id, subject: subjectDocs[index]._id, semester: semesterDocs[index]._id, section: sectionDocs[index]._id },
      {
        teacher: teacherDocs[index]._id,
        subject: subjectDocs[index]._id,
        course: courseDocs[index]._id,
        semester: semesterDocs[index]._id,
        section: sectionDocs[index]._id,
        academicYear: academicYears[index]._id,
        isActive: true,
      }
    );

    await upsertOne(
      Counseling,
      { email: `${names[index][0]}.${names[index][1]}.lead@college.example`.toLowerCase() },
      {
        firstName: names[index][0],
        lastName: names[index][1],
        email: `${names[index][0]}.${names[index][1]}.lead@college.example`.toLowerCase(),
        phone: `80808000${String(index + 1).padStart(2, "0")}`,
        gender: index % 3 === 0 ? "Female" : index % 3 === 1 ? "Male" : "Other",
        dateOfBirth: date(`${2004 + (index % 2)}-${String((index % 9) + 1).padStart(2, "0")}-18`),
        previousQualification: index % 2 === 0 ? "Class 12" : "Diploma",
        desiredCourse: courseDocs[index]._id,
        counselorName: teacherDocs[index].firstName + " " + teacherDocs[index].lastName,
        remarks: "Seed counseling record linked to desired course.",
        status: index % 4 === 0 ? "PENDING" : index % 4 === 1 ? "CONTACTED" : index % 4 === 2 ? "ADMITTED" : "REJECTED",
      }
    );
  }

  console.table({
    AcademicYear: academicYears.length,
    Department: departmentDocs.length,
    Course: courseDocs.length,
    Session: sessionDocs.length,
    Semester: semesterDocs.length,
    Teacher: teacherDocs.length,
    Classroom: classroomDocs.length,
    Section: sectionDocs.length,
    Student: studentDocs.length,
    Subject: subjectDocs.length,
    Admission: admissionDocs.length,
    AdmissionEmi: COUNT,
    Attendance: COUNT,
    ExamSchedule: examScheduleDocs.length,
    ExamResult: COUNT,
    Timetable: COUNT,
    SubjectAssignment: COUNT,
    Counseling: COUNT,
  });
};

seedCoreData()
  .then(async () => {
    await mongoose.disconnect();
    console.log("Core seed data completed.");
  })
  .catch(async (error) => {
    console.error("Core seed data failed:", error);
    await mongoose.disconnect();
    process.exit(1);
  });
