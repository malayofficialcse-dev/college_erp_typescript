import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Attendance = () => (
  <CoreResourcePage
    title="Student Attendance"
    endpoint="/attendance"
    icon="bi-calendar-check-fill"
    relations={{
      students: { endpoint: '/students', labelPaths: ['enrollmentNumber', 'firstName', 'lastName'] },
      subjects: { endpoint: '/subjects', labelPaths: ['subjectCode', 'subjectName'] },
    }}
    fields={[
      { name: 'student', label: 'Student', type: 'select', options: 'students' },
      { name: 'subject', label: 'Subject', type: 'select', options: 'subjects', optional: true },
      { name: 'attendanceDate', label: 'Date', type: 'date' },
      { name: 'status', label: 'Status', type: 'select', optionsList: [{ value: 'PRESENT', label: 'Present' }, { value: 'ABSENT', label: 'Absent' }, { value: 'LATE', label: 'Late' }, { value: 'EXCUSED', label: 'Excused' }], defaultValue: 'PRESENT' },
      { name: 'remarks', label: 'Remarks', type: 'textarea', optional: true },
    ]}
    columns={[
      { key: 'student', label: 'Student', className: 'px-4 fw-bold text-primary', render: (item) => item.student ? `${item.student.firstName} ${item.student.lastName}` : 'N/A' },
      { key: 'subject.subjectName', label: 'Subject' },
      { key: 'attendanceDate', label: 'Date', render: (item) => String(item.attendanceDate || '').slice(0, 10) || 'N/A' },
      { key: 'status', label: 'Status' },
    ]}
  />
);

export default Attendance;
