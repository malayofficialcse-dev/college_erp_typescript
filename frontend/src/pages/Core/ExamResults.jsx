import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const ExamResults = () => (
  <CoreResourcePage
    title="Exam Results"
    endpoint="/exam-results"
    icon="bi-award-fill"
    relations={{
      students: { endpoint: '/students', labelPaths: ['enrollmentNumber', 'firstName', 'lastName'] },
      subjects: { endpoint: '/subjects', labelPaths: ['subjectCode', 'subjectName'] },
      examSchedules: { endpoint: '/exam-schedules', labelPaths: ['examName'] },
    }}
    fields={[
      { name: 'student', label: 'Student', type: 'select', options: 'students' },
      { name: 'subject', label: 'Subject', type: 'select', options: 'subjects' },
      { name: 'examSchedule', label: 'Exam', type: 'select', options: 'examSchedules', optional: true },
      { name: 'obtainedMarks', label: 'Obtained Marks', type: 'number' },
      { name: 'totalMarks', label: 'Total Marks', type: 'number', defaultValue: 100 },
      { name: 'grade', label: 'Grade', placeholder: 'e.g. A, B, C', optional: true },
      { name: 'remarks', label: 'Remarks', type: 'textarea', optional: true },
    ]}
    columns={[
      { key: 'student', label: 'Student', className: 'px-4 fw-bold text-primary', render: (item) => item.student ? `${item.student.firstName} ${item.student.lastName}` : 'N/A' },
      { key: 'subject.subjectName', label: 'Subject' },
      { key: 'obtainedMarks', label: 'Marks Obtained' },
      { key: 'totalMarks', label: 'Total Marks' },
      { key: 'grade', label: 'Grade' },
    ]}
  />
);

export default ExamResults;
