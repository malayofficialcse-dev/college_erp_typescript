import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const AdmissionEmiSchedule = () => (
  <CoreResourcePage
    title="Admission EMI Schedules"
    endpoint="/admission-emi"
    icon="bi-calendar-check-fill"
    relations={{
      admissions: { endpoint: '/admissions', labelPaths: ['id', 'firstName', 'lastName'] },
    }}
    fields={[
      { name: 'admission', label: 'Admission', type: 'select', options: 'admissions' },
      { name: 'totalEmiAmount', label: 'Total EMI Amount', type: 'number' },
      { name: 'numberOfEmis', label: 'Number of EMIs', type: 'number', defaultValue: 1 },
      { name: 'emiStartDate', label: 'EMI Start Date', type: 'date' },
      { name: 'emiEndDate', label: 'EMI End Date', type: 'date', optional: true },
      { name: 'emiStatus', label: 'EMI Status', type: 'select', optionsList: [{ value: 'PENDING', label: 'Pending' }, { value: 'PARTIAL', label: 'Partial' }, { value: 'COMPLETED', label: 'Completed' }, { value: 'OVERDUE', label: 'Overdue' }], defaultValue: 'PENDING' },
    ]}
    columns={[
      { key: 'admission', label: 'Admission', className: 'px-4 fw-bold text-primary', render: (item) => item.admission ? `${item.admission.firstName} ${item.admission.lastName}` : 'N/A' },
      { key: 'totalEmiAmount', label: 'Total Amount' },
      { key: 'numberOfEmis', label: 'EMIs Count' },
      { key: 'emiStartDate', label: 'Start Date', render: (item) => String(item.emiStartDate || '').slice(0, 10) || 'N/A' },
      { key: 'emiStatus', label: 'Status' },
    ]}
  />
);

export default AdmissionEmiSchedule;
