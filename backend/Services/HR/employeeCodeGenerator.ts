import Employee from "../../Models/HR/Employee.ts";

/**
 * Generates a sequential employee code (e.g., EMP2600001, EMP2600002)
 * Format: EMP + YYMMDD + sequential number
 */
export const generateEmployeeCode = async (): Promise<string> => {
  try {
    const today = new Date();
    const year = String(today.getFullYear()).slice(-2);
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    const datePrefix = `EMP${year}${month}${day}`;

    const lastEmployee = await Employee.findOne({
      employeeCode: new RegExp(`^${datePrefix}`),
    })
      .sort({ employeeCode: -1 })
      .lean();

    let sequenceNumber = 1;
    if (lastEmployee && lastEmployee.employeeCode) {
      const lastCode = lastEmployee.employeeCode;
      const lastSequence = parseInt(lastCode.slice(-5), 10);
      sequenceNumber = lastSequence + 1;
    }

    const employeeCode = `${datePrefix}${String(sequenceNumber).padStart(5, "0")}`;
    return employeeCode;
  } catch (error) {
    throw new Error(
      `Failed to generate employee code: ${error instanceof Error ? error.message : "unknown error"}`
    );
  }
};
