import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Subjects = () => (
  <CoreResourcePage
    title="Subjects"
    endpoint="/subjects"
    icon="bi-book-half"
    relations={{
      courses: { endpoint: '/courses', labelPaths: ['code', 'name'] },
      semesters: { endpoint: '/semesters', labelPaths: ['name', 'semesterNumber'] },
    }}
    fields={[
      { name: 'subjectCode', label: 'Subject Code' },
      { name: 'subjectName', label: 'Subject Name' },
      { name: 'description', label: 'Description', type: 'textarea', optional: true },
      { name: 'course', label: 'Course', type: 'select', options: 'courses', optional: true },
      { name: 'semester', label: 'Semester', type: 'select', options: 'semesters', optional: true },
      { name: 'credits', label: 'Credits', type: 'number', defaultValue: 3, optional: true },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true, cols: 12 },
    ]}
    columns={[
      { key: 'subjectCode', label: 'Code', className: 'px-4 fw-bold text-primary' },
      { key: 'subjectName', label: 'Name' },
      { key: 'course.name', label: 'Course' },
      { key: 'semester.name', label: 'Semester' },
      { key: 'credits', label: 'Credits' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default Subjects;
