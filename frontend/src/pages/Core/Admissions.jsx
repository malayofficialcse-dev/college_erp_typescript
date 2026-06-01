import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Admissions = () => (
  <CoreResourcePage
    title="Admissions"
    endpoint="/core/admissions"
    icon="bi-mortarboard-fill"
    relations={{
      courses: { endpoint: '/courses', labelPaths: ['code', 'name'] },
      academicYears: { endpoint: '/academic-years', labelPaths: ['name'] },
    }}
    fields={[
      { name: 'enrollmentNumber', label: 'Enrollment Number', optional: true },
      { name: 'firstName', label: 'First Name' },
      { name: 'lastName', label: 'Last Name' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone Number' },
      { name: 'dateOfBirth', label: 'Date of Birth', type: 'date', optional: true },
      { name: 'course', label: 'Course', type: 'select', options: 'courses' },
      { name: 'academicYear', label: 'Academic Year', type: 'select', options: 'academicYears' },
      { name: 'admissionDate', label: 'Admission Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', optionsList: [{ value: 'PENDING', label: 'Pending' }, { value: 'APPROVED', label: 'Approved' }, { value: 'REJECTED', label: 'Rejected' }, { value: 'ENROLLED', label: 'Enrolled' }], defaultValue: 'PENDING' },
      { name: 'parentName', label: 'Parent/Guardian Name', optional: true },
      { name: 'parentPhone', label: 'Parent Phone', optional: true },
    ]}
    columns={[
      { key: 'enrollmentNumber', label: 'Enrollment No.', className: 'px-4 fw-bold text-primary' },
      { key: 'billNumber', label: 'Bill No.', render: (item) => item.billNumber || 'N/A' },
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'course.name', label: 'Course' },
      { key: 'admissionDate', label: 'Admission Date', render: (item) => String(item.admissionDate || '').slice(0, 10) || 'N/A' },
      { key: 'status', label: 'Status' },
    ]}
  />
);

export default Admissions;
