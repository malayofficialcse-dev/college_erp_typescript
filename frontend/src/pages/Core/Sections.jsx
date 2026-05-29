import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Sections = () => (
  <CoreResourcePage
    title="Sections"
    endpoint="/sections"
    icon="bi-diagram-3"
    relations={{
      departments: { endpoint: '/departments', labelPaths: ['code', 'name'] },
      courses: { endpoint: '/courses', labelPaths: ['code', 'name'] },
      semesters: { endpoint: '/semesters', labelPaths: ['name', 'semesterNumber'] },
      academicYears: { endpoint: '/academic-years', labelPaths: ['name'] },
      teachers: { endpoint: '/teachers', labelPaths: ['employeeCode', 'firstName', 'lastName'] },
    }}
    fields={[
      { name: 'name', label: 'Section Name' },
      { name: 'code', label: 'Section Code' },
      { name: 'department', label: 'Department', type: 'select', options: 'departments' },
      { name: 'course', label: 'Course', type: 'select', options: 'courses' },
      { name: 'semester', label: 'Semester', type: 'select', options: 'semesters' },
      { name: 'academicYear', label: 'Academic Year', type: 'select', options: 'academicYears', optional: true },
      { name: 'capacity', label: 'Capacity', type: 'number', defaultValue: 60 },
      { name: 'classTeacher', label: 'Class Teacher', type: 'select', options: 'teachers', optional: true },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'code', label: 'Code', className: 'px-4 fw-bold text-primary' },
      { key: 'name', label: 'Name' },
      { key: 'department.name', label: 'Department' },
      { key: 'course.name', label: 'Course' },
      { key: 'semester.name', label: 'Semester' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default Sections;
