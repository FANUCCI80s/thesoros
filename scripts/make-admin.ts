import "dotenv/config";

import { domainToASCII } from "node:url";

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

import bcrypt from "bcryptjs";

const ADMIN_EMAIL =
  "support@thésoros.com";

const databaseUrl =
  process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("");
  console.error(
    "❌ DATABASE_URL is missing from your .env file."
  );
  console.error("");

  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

const adapter =
  new PrismaPg(pool);

const prisma =
  new PrismaClient({
    adapter,
  });

function normalizeEmail(
  email: string
): string {
  const value =
    email.trim().toLowerCase();

  const atIndex =
    value.lastIndexOf("@");

  if (
    atIndex <= 0 ||
    atIndex === value.length - 1
  ) {
    return value;
  }

  const localPart =
    value.slice(0, atIndex);

  const domain =
    value.slice(atIndex + 1);

  const asciiDomain =
    domainToASCII(domain);

  if (!asciiDomain) {
    return value;
  }

  return `${localPart}@${asciiDomain}`;
}

async function main() {
  const canonicalEmail =
    normalizeEmail(
      ADMIN_EMAIL
    );

  const unicodeEmail =
    ADMIN_EMAIL
      .trim()
      .toLowerCase();

  const adminPassword =
    process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    throw new Error(
      "ADMIN_PASSWORD is missing from the environment."
    );
  }

  if (adminPassword.length < 8) {
    throw new Error(
      "ADMIN_PASSWORD must contain at least 8 characters."
    );
  }

  console.log("");
  console.log(
    "======================================"
  );
  console.log(
    "       THÉSOROS ADMIN SETUP"
  );
  console.log(
    "======================================"
  );
  console.log("");

  console.log(
    `Original email:  ${unicodeEmail}`
  );

  console.log(
    `Canonical email: ${canonicalEmail}`
  );

  /*
   * First check for the canonical
   * ASCII/Punycode email.
   */
  let user =
    await prisma.user.findUnique({
      where: {
        email: canonicalEmail,
      },
    });

  /*
   * If the account was originally created
   * using the Unicode domain, find that
   * version instead.
   */
  if (!user) {
    user =
      await prisma.user.findUnique({
        where: {
          email: unicodeEmail,
        },
      });
  }

  if (!user) {
    console.error("");

    console.error(
      `❌ No user was found with either:`
    );

    console.error(
      `   ${canonicalEmail}`
    );

    console.error(
      `   ${unicodeEmail}`
    );

    console.error("");

    process.exitCode = 1;

    return;
  }

  console.log("");

  console.log(
    `Found user: ${user.firstName} ${user.lastName}`
  );

  console.log(
    `Current database email: ${user.email}`
  );

  console.log("");

  console.log(
    "Updating admin account..."
  );

  const passwordHash =
    await bcrypt.hash(
      adminPassword,
      12
    );

  const updatedUser =
    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        email: canonicalEmail,
        passwordHash,
        role: "ADMIN",
        status: "ACTIVE",
        emailVerified: true,
      },

      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        emailVerified: true,
      },
    });

  console.log("");

  console.log(
    "======================================"
  );

  console.log(
    "       THÉSOROS ADMIN READY"
  );

  console.log(
    "======================================"
  );

  console.log("");

  console.log(
    `Name:     ${updatedUser.firstName} ${updatedUser.lastName}`
  );

  console.log(
    `Email:    ${updatedUser.email}`
  );

  console.log(
    `Role:     ${updatedUser.role}`
  );

  console.log(
    `Status:   ${updatedUser.status}`
  );

  console.log(
    `Verified: ${
      updatedUser.emailVerified
        ? "YES"
        : "NO"
    }`
  );

  console.log("");

  console.log(
    "Password updated successfully."
  );

  console.log(
    "Admin account updated successfully."
  );

  console.log("");
}

main()
  .catch((error) => {
    console.error("");

    console.error(
      "❌ Failed to update THÉSOROS admin account:"
    );

    console.error("");

    console.error(error);

    console.error("");

    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();

    await pool.end();
  });