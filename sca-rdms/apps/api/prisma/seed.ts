/**
 * SCA Report & Document Management System — Prisma seed script
 * Phase 2
 *
 * Run with: npm run prisma:seed --workspace=apps/api
 * (requires a live PostgreSQL instance and a generated Prisma Client —
 * see infra/docker-compose.yml for local Postgres/Redis/MinIO.)
 */

import { PrismaClient, ReportCadence } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────
// Permission catalogue: resource:action pairs referenced by FR-* in the SRS
// ─────────────────────────────────────────────────────────────
const RESOURCES = [
  "user",
  "role",
  "department",
  "programme",
  "project",
  "report",
  "document",
  "analytics",
  "audit_log",
  "settings",
  "backup",
  "notification",
] as const;

const ACTIONS = ["create", "read", "update", "delete", "approve", "reject", "export", "download", "manage"] as const;

function permKey(resource: string, action: string) {
  return `${resource}:${action}`;
}

// Role → permission-key list. "manage" implies full CRUD for that resource.
const ROLE_PERMISSIONS: Record<string, string[]> = {
  SUPER_ADMIN: RESOURCES.flatMap((r) => ACTIONS.map((a) => permKey(r, a))), // everything
  EXECUTIVE_DIRECTOR: [
    "report:read", "report:approve", "report:reject", "report:export",
    "document:read", "document:download",
    "analytics:read", "analytics:export",
    "department:read", "programme:read", "project:read",
    "audit_log:read",
    "user:read",
  ],
  PROGRAMME_MANAGER: [
    "report:read", "report:create", "report:update", "report:approve", "report:reject", "report:export",
    "document:read", "document:create", "document:download",
    "analytics:read",
    "programme:read", "programme:update", "project:read", "project:update",
    "user:read",
  ],
  PROJECT_OFFICER: [
    "report:create", "report:read", "report:update", "report:export",
    "document:create", "document:read", "document:download",
    "project:read",
  ],
  ME_OFFICER: [
    "report:read", "report:create", "report:export",
    "document:read", "document:download",
    "analytics:read", "analytics:export",
  ],
  FINANCE_OFFICER: [
    "report:create", "report:read", "report:export",
    "document:create", "document:read", "document:download",
    "analytics:read",
  ],
  HR_OFFICER: [
    "document:create", "document:read", "document:download",
    "user:read", "user:update",
  ],
  STAFF: [
    "report:create", "report:read", "report:update",
    "document:create", "document:read", "document:download",
  ],
};

async function seedRolesAndPermissions() {
  const permissionRecords = new Map<string, string>(); // key -> id

  for (const resource of RESOURCES) {
    for (const action of ACTIONS) {
      const perm = await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action },
      });
      permissionRecords.set(permKey(resource, action), perm.id);
    }
  }

  const roleDescriptions: Record<string, string> = {
    SUPER_ADMIN: "Full system control: users, roles, permissions, settings, backups.",
    EXECUTIVE_DIRECTOR: "Org-wide visibility, final approvals, analytics, department oversight.",
    PROGRAMME_MANAGER: "Manages programmes, approves reports, monitors staff.",
    PROJECT_OFFICER: "Submits/edits reports, uploads documents, tracks projects.",
    ME_OFFICER: "Generates statistics, dashboards, exports; analyses performance.",
    FINANCE_OFFICER: "Uploads finance documents, submits financial reports, views finance analytics.",
    HR_OFFICER: "Uploads HR documents, manages staff records.",
    STAFF: "Submits own reports, uploads files, views own reports.",
  };

  const roles: Record<string, string> = {};
  for (const [name, description] of Object.entries(roleDescriptions)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description },
      create: { name, description, isSystemRole: true },
    });
    roles[name] = role.id;

    const keys = ROLE_PERMISSIONS[name] ?? [];
    for (const key of keys) {
      const permissionId = permissionRecords.get(key);
      if (!permissionId) continue;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId } },
        update: {},
        create: { roleId: role.id, permissionId },
      });
    }
  }

  return roles;
}

async function seedOrganizationProfile() {
  const existing = await prisma.organizationProfile.findFirst();
  if (existing) return existing;

  return prisma.organizationProfile.create({
    data: {
      name: "Stop Child Abuse (SCA)",
      mission:
        "Every child has the right to live free from violence, exploitation and abuse. SCA empowers refugee and host communities to safeguard children through education, advocacy, and sustainable infrastructure.",
      vision: "Heal. Protect. Restore.",
      email: "info@sca.or.ke",
      phone: "+254 104 613 110",
      registrationDetails:
        "Kenya: 'Stop Child Abuse Community Based Organization', Community Groups Registration Act No. 30 of 2022, Cert. SOSDO/TKW/IRG/CBO/B0-09, Kakuma, Turkana County. " +
        "DRC: 'Child Abuse in Congo/VASTARE' (ASBL), receipt no. F.92/30.987, Uvira, South Kivu.",
    },
  });
}

async function seedDepartments() {
  const names = [
    { name: "Executive Office", description: "Executive Director and organizational leadership." },
    { name: "Programmes", description: "Child protection, education, and development programmes." },
    { name: "Monitoring & Evaluation", description: "M&E, statistics, and performance analysis." },
    { name: "Finance", description: "Budgeting, financial reporting, and compliance." },
    { name: "Human Resources", description: "Staffing, records, and HR policy." },
  ];
  const departments: Record<string, string> = {};
  for (const d of names) {
    const dept = await prisma.department.upsert({
      where: { name: d.name },
      update: { description: d.description },
      create: d,
    });
    departments[d.name] = dept.id;
  }
  return departments;
}

async function seedLocations() {
  const kakuma = await prisma.location.create({
    data: { country: "Kenya", region: "Rift Valley", county: "Turkana", subCounty: "Turkana West", ward: "Kakuma" },
  });
  const uvira = await prisma.location.create({
    data: { country: "DR Congo", region: "South Kivu", county: "Uvira", subCounty: null, ward: null },
  });
  return { kakuma, uvira };
}

async function seedProgrammesAndProjects(departments: Record<string, string>) {
  const programmeDefs = [
    { name: "Child Protection", description: "Community-led protection systems for at-risk children." },
    { name: "Early Childhood Development", description: "Foundational learning, health, and well-being for young children." },
    { name: "Child Nutrition", description: "Addressing malnutrition among the most vulnerable children." },
    { name: "Adolescent Development & Participation", description: "Skills, platforms, and leadership for displaced adolescents." },
    { name: "Advocacy", description: "Awareness-raising, victim support, and policy influence for child rights." },
  ];

  const programmes: Record<string, string> = {};
  for (const p of programmeDefs) {
    const programme = await prisma.programme.create({
      data: { ...p, departmentId: departments["Programmes"], status: "ACTIVE" },
    });
    programmes[p.name] = programme.id;
  }

  await prisma.project.create({
    data: {
      name: "Kakuma Child Safeguarding Initiative",
      description: "Community-based child safeguarding and referral pathways in Kakuma Refugee Camp.",
      programmeId: programmes["Child Protection"],
      status: "ACTIVE",
    },
  });

  await prisma.project.create({
    data: {
      name: "Early Learning Spaces — Kakuma & Kalobeyei",
      description: "Early childhood development centers serving refugee and host-community children.",
      programmeId: programmes["Early Childhood Development"],
      status: "ACTIVE",
    },
  });

  await prisma.project.create({
    data: {
      name: "Uvira Community Nutrition Response",
      description: "Nutrition screening and supplementary feeding in Uvira, South Kivu.",
      programmeId: programmes["Child Nutrition"],
      status: "ACTIVE",
    },
  });

  return programmes;
}

async function seedReportTypes() {
  const defs: { name: string; cadence: ReportCadence; approvalChainTemplate: string[] }[] = [
    { name: "Daily Report", cadence: "DAILY", approvalChainTemplate: ["PROGRAMME_MANAGER"] },
    { name: "Weekly Report", cadence: "WEEKLY", approvalChainTemplate: ["PROGRAMME_MANAGER"] },
    { name: "Monthly Report", cadence: "MONTHLY", approvalChainTemplate: ["PROGRAMME_MANAGER", "EXECUTIVE_DIRECTOR"] },
    { name: "Quarterly Report", cadence: "QUARTERLY", approvalChainTemplate: ["PROGRAMME_MANAGER", "EXECUTIVE_DIRECTOR"] },
    { name: "Annual Report", cadence: "ANNUAL", approvalChainTemplate: ["PROGRAMME_MANAGER", "EXECUTIVE_DIRECTOR"] },
    { name: "Project Report", cadence: "AD_HOC", approvalChainTemplate: ["PROGRAMME_MANAGER"] },
    { name: "Programme Report", cadence: "AD_HOC", approvalChainTemplate: ["EXECUTIVE_DIRECTOR"] },
    { name: "Donor Report", cadence: "AD_HOC", approvalChainTemplate: ["PROGRAMME_MANAGER", "EXECUTIVE_DIRECTOR"] },
    { name: "Monitoring Report", cadence: "AD_HOC", approvalChainTemplate: ["PROGRAMME_MANAGER"] },
    { name: "Evaluation Report", cadence: "AD_HOC", approvalChainTemplate: ["EXECUTIVE_DIRECTOR"] },
    { name: "Finance Report", cadence: "MONTHLY", approvalChainTemplate: ["EXECUTIVE_DIRECTOR"] },
    { name: "Training Report", cadence: "AD_HOC", approvalChainTemplate: ["PROGRAMME_MANAGER"] },
    { name: "Incident Report", cadence: "AD_HOC", approvalChainTemplate: ["PROGRAMME_MANAGER", "EXECUTIVE_DIRECTOR"] },
    { name: "Emergency Report", cadence: "AD_HOC", approvalChainTemplate: ["EXECUTIVE_DIRECTOR"] },
  ];

  for (const d of defs) {
    await prisma.reportType.upsert({
      where: { name: d.name },
      update: { cadence: d.cadence, approvalChainTemplate: d.approvalChainTemplate },
      create: d,
    });
  }
}

async function seedUsers(roles: Record<string, string>, departments: Record<string, string>) {
  const defaultPassword = await bcrypt.hash("ChangeMe!2026", 12);

  const users = [
    { firstName: "System", lastName: "Administrator", email: "admin@sca.or.ke", role: "SUPER_ADMIN", dept: "Executive Office" },
    { firstName: "Executive", lastName: "Director", email: "ed@sca.or.ke", role: "EXECUTIVE_DIRECTOR", dept: "Executive Office" },
    { firstName: "Programme", lastName: "Manager", email: "programme.manager@sca.or.ke", role: "PROGRAMME_MANAGER", dept: "Programmes" },
    { firstName: "Project", lastName: "Officer", email: "project.officer@sca.or.ke", role: "PROJECT_OFFICER", dept: "Programmes" },
    { firstName: "M&E", lastName: "Officer", email: "me.officer@sca.or.ke", role: "ME_OFFICER", dept: "Monitoring & Evaluation" },
    { firstName: "Finance", lastName: "Officer", email: "finance.officer@sca.or.ke", role: "FINANCE_OFFICER", dept: "Finance" },
    { firstName: "HR", lastName: "Officer", email: "hr.officer@sca.or.ke", role: "HR_OFFICER", dept: "Human Resources" },
    { firstName: "Field", lastName: "Staff", email: "staff@sca.or.ke", role: "STAFF", dept: "Programmes" },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        passwordHash: defaultPassword,
        roleId: roles[u.role],
        departmentId: departments[u.dept],
        isEmailVerified: true,
        isActive: true,
      },
    });
  }

  console.log(
    "Seeded demo users with password 'ChangeMe!2026' — rotate these immediately outside of development."
  );
}

async function main() {
  console.log("Seeding SCA Report & Document Management System...");
  await seedOrganizationProfile();
  const roles = await seedRolesAndPermissions();
  const departments = await seedDepartments();
  await seedLocations();
  await seedProgrammesAndProjects(departments);
  await seedReportTypes();
  await seedUsers(roles, departments);
  console.log("Seed complete.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
