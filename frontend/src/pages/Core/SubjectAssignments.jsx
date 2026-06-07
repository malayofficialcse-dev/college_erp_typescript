import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const teacherName = (teacher) =>
  teacher ? [teacher.employeeCode, teacher.firstName, teacher.lastName].filter(Boolean).join(' - ') : 'N/A';

const SubjectAssignments = () => (
  <CoreResourcePage
    title="Subject Assignments"
    endpoint="/subject-assignments"
    icon="bi-person-lines-fill"
    relations={{
      teachers: { endpoint: '/teachers', labelPaths: ['employeeCode', 'firstName', 'lastName'], filterByDepartment: true },
      subjects: { endpoint: '/subjects', labelPaths: ['subjectCode', 'subjectName'], filterByDepartment: true },
      courses: { endpoint: '/courses', labelPaths: ['code', 'name'], filterByDepartment: true },
      semesters: { endpoint: '/semesters', labelPaths: ['name', 'semesterNumber'] },
      sections: { endpoint: '/sections', labelPaths: ['code', 'name'], filterByDepartment: true },
      academicYears: { endpoint: '/academic-years', labelPaths: ['name'] },
    }}
    fields={[
      { name: 'teacher', label: 'Teacher', type: 'select', options: 'teachers' },
      { name: 'subject', label: 'Subject', type: 'select', options: 'subjects' },
      { name: 'course', label: 'Course', type: 'select', options: 'courses' },
      { name: 'semester', label: 'Semester', type: 'select', options: 'semesters' },
      { name: 'section', label: 'Section', type: 'select', options: 'sections', optional: true },
      { name: 'academicYear', label: 'Academic Year', type: 'select', options: 'academicYears', optional: true },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'teacher', label: 'Teacher', className: 'px-4 fw-bold text-primary', render: (item) => teacherName(item.teacher) },
      { key: 'subject.subjectName', label: 'Subject' },
      { key: 'course.name', label: 'Course' },
      { key: 'semester.name', label: 'Semester' },
      { key: 'section.name', label: 'Section' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default SubjectAssignments;
