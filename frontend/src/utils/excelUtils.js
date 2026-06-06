import * as XLSX from 'xlsx';

export const exportToExcel = (data, fileName = 'export.xlsx') => {
  try {
    // Create a new workbook
    const workbook = XLSX.utils.book_new();
    
    // Convert data to worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
    
    // Write the file
    XLSX.writeFile(workbook, fileName);
    
    return true;
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
};

export const importFromExcel = (file) => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          resolve(jsonData);
        } catch (error) {
          reject(new Error('Failed to parse Excel file'));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsArrayBuffer(file);
    } catch (error) {
      reject(error);
    }
  });
};

export const validateCounselingData = (data) => {
  const errors = [];
  const validated = [];
  
  data.forEach((row, index) => {
    const rowErrors = [];
    
    // Validate required fields
    if (!row.firstName || !row.firstName.toString().trim()) {
      rowErrors.push('First Name is required');
    }
    if (!row.lastName || !row.lastName.toString().trim()) {
      rowErrors.push('Last Name is required');
    }
    if (!row.email || !row.email.toString().trim()) {
      rowErrors.push('Email is required');
    }
    if (!row.phone || !row.phone.toString().trim()) {
      rowErrors.push('Phone is required');
    }
    
    // Validate email format
    if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email.toString())) {
      rowErrors.push('Invalid email format');
    }
    
    if (rowErrors.length > 0) {
      errors.push({ row: index + 2, errors: rowErrors });
    } else {
      validated.push({
        firstName: row.firstName.toString().trim(),
        lastName: row.lastName.toString().trim(),
        email: row.email.toString().trim(),
        phone: row.phone.toString().trim(),
        gender: row.gender ? row.gender.toString() : 'Male',
        dateOfBirth: row.dateOfBirth ? row.dateOfBirth.toString() : '',
        previousQualification: row.previousQualification ? row.previousQualification.toString() : '',
        desiredCourse: row.desiredCourse ? row.desiredCourse.toString() : '',
        counselorName: row.counselorName ? row.counselorName.toString() : '',
        remarks: row.remarks ? row.remarks.toString() : '',
        status: row.status ? row.status.toString() : 'PENDING'
      });
    }
  });
  
  return { validated, errors };
};

export const downloadTemplate = () => {
  const templateData = [
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '9876543210',
      gender: 'Male',
      dateOfBirth: '2003-05-15',
      previousQualification: 'High School',
      desiredCourse: 'Information Technology Program',
      counselorName: 'Mr. Smith',
      remarks: 'Interested in IT',
      status: 'PENDING'
    }
  ];
  
  try {
    exportToExcel(templateData, 'Counseling_Import_Template.xlsx');
  } catch (error) {
    console.error('Error downloading template:', error);
    alert('Error downloading template. Please ensure xlsx library is installed.');
  }
};
