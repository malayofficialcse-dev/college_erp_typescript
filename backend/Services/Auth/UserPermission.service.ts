import UserPermission from "../../Models/Auth/UserPermission.ts";
import {
  ALL_PAGE_KEYS,
  buildDefaultPagePermissions,
} from "../../config/pagePermissions.ts";

const LEGACY_MODULE_TO_PAGES: Record<string, string[]> = {
  students: ["students", "core-students"],
  employees: [
    "employees",
    "staff-attendance",
    "hr-leave-inbox",
    "hr-resignation-inbox",
    "leaves",
    "leave-approvals",
  ],
  departments: [
    "core-departments",
    "core-classrooms",
    "core-sections",
    "core-sessions",
    "core-subject-assignments",
  ],
  payroll: ["payroll", "my-payslips"],
  academics: [
    "academic-years",
    "semesters",
    "teachers",
    "courses",
    "subjects",
    "timetable",
    "attendance",
    "exam-schedules",
    "exam-results",
    "counseling",
    "admissions",
    "core-counseling",
    "core-admissions",
    "core-academic-years",
    "core-semesters",
    "core-courses",
    "core-teachers",
    "core-subjects",
    "core-timetable",
    "core-attendance",
    "core-exam-schedules",
    "core-exam-results",
  ],
  library: ["library", "book-reservations"],
  hostel: ["hostel"],
  transport: ["transport"],
  finance: ["fees", "payment-analysis", "fee-invoices", "scholarships", "reports"],
  notices: ["notices", "events", "event-registrations", "notifications"],
};

const emptyPermission = (pageKey: string) => ({
  moduleName: pageKey,
  canView: false,
  canCreate: false,
  canEdit: false,
  canDelete: false,
});

export const resolveUserPermissions = (
  storedPermissions: Array<{
    moduleName: string;
    canView?: boolean;
    canCreate?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
  }> = [],
  roles: string[] = []
) => {
  const byKey = new Map<string, ReturnType<typeof emptyPermission>>();

  for (const permission of storedPermissions) {
    byKey.set(permission.moduleName, {
      moduleName: permission.moduleName,
      canView: !!permission.canView,
      canCreate: !!permission.canCreate,
      canEdit: !!permission.canEdit,
      canDelete: !!permission.canDelete,
    });
  }

  for (const [legacyModule, pageKeys] of Object.entries(LEGACY_MODULE_TO_PAGES)) {
    const legacy = byKey.get(legacyModule);
    if (!legacy) continue;

    for (const pageKey of pageKeys) {
      if (!byKey.has(pageKey)) {
        byKey.set(pageKey, { ...legacy, moduleName: pageKey });
      }
    }
  }

  const roleDefaults = new Map(
    buildDefaultPagePermissions(roles).map((permission) => [
      permission.moduleName,
      permission,
    ])
  );

  return ALL_PAGE_KEYS.map((pageKey) => {
    if (byKey.has(pageKey)) {
      return byKey.get(pageKey)!;
    }
    return roleDefaults.get(pageKey) || emptyPermission(pageKey);
  });
};

export const seedDefaultPermissions = async (
  userId: string,
  roles: string[] = []
) => {
  const defaults = buildDefaultPagePermissions(roles);

  await Promise.all(
    defaults.map(({ moduleName, canView, canCreate, canEdit, canDelete }) =>
      UserPermission.findOneAndUpdate(
        { user: userId, moduleName },
        {
          user: userId,
          moduleName,
          canView,
          canCreate,
          canEdit,
          canDelete,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
};

export const getAllConfiguredPageKeys = () => ALL_PAGE_KEYS;
