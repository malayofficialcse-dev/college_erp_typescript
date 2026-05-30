/**
 * Generates email from employee name
 * Format: firstname.lastname@college.edu.in
 * Converts to lowercase and removes special characters
 */
export const generateEmailFromName = (firstName: string, lastName: string): string => {
  const sanitize = (name: string): string => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, "");
  };

  const firstName_ = sanitize(firstName);
  const lastName_ = sanitize(lastName);

  if (!firstName_ || !lastName_) {
    throw new Error("First name and last name are required to generate email");
  }

  return `${firstName_}.${lastName_}@college.edu.in`;
};
