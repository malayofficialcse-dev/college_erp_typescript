import React from 'react';
import CoreResourcePage from './CoreResourcePage';

const Classrooms = () => (
  <CoreResourcePage
    title="Classrooms"
    endpoint="/classrooms"
    icon="bi-door-open"
    fields={[
      { name: 'roomNumber', label: 'Room Number' },
      { name: 'building', label: 'Building' },
      { name: 'floor', label: 'Floor', type: 'number', defaultValue: 0, optional: true },
      { name: 'capacity', label: 'Capacity', type: 'number', defaultValue: 60 },
      {
        name: 'roomType',
        label: 'Room Type',
        type: 'select',
        defaultValue: 'LECTURE',
        optionsList: [
          { value: 'LECTURE', label: 'Lecture' },
          { value: 'LAB', label: 'Lab' },
          { value: 'SEMINAR', label: 'Seminar' },
          { value: 'AUDITORIUM', label: 'Auditorium' },
        ],
      },
      { name: 'isActive', label: 'Active', type: 'checkbox', defaultValue: true },
    ]}
    columns={[
      { key: 'roomNumber', label: 'Room', className: 'px-4 fw-bold text-primary' },
      { key: 'building', label: 'Building' },
      { key: 'floor', label: 'Floor' },
      { key: 'capacity', label: 'Capacity' },
      { key: 'roomType', label: 'Type' },
      { key: 'isActive', label: 'Status' },
    ]}
  />
);

export default Classrooms;
