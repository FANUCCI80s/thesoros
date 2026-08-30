
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/auth/password";

const ADMIN_EMAIL = "support@thésoros.com";

async function main() {
  const email = ADMIN_EMAIL.trim().toLowerCase();

  const adminPassword = process.env.ADMIN_PASSWORD;

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
  console.log("======================================");
  console.log("       THÉSOROS ADMIN SETUP");
  console.log("======================================");
  console.log("");

  console.log(`Looking for ${email}...`);

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    console.error("");
    console.error(
      `❌ No user was found with email: ${email}`
    );
    console.error("");
    console.error(
      "Create the admin account first using:"
    );
    console.error("");
    console.error(
      "node scripts\\create-admin.mjs"
    );
    console.error("");

    process.exitCode = 1;
    return;
  }

  console.log(
    `Found user: ${user.firstName} ${user.lastName}`
  );

  console.log("Updating account...");

  const passwordHash =
    await hashPassword(adminPassword);

  const updatedUser =
    await prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        email,
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
  console.log("======================================");
  console.log("       THÉSOROS ADMIN READY");
  console.log("======================================");
  console.log("");
  console.log(
    `Name:     ${updatedUser.firstName} ${updatedUser.lastName}`
  );
  console.log(`Email:    ${updatedUser.email}`);
  console.log(`Role:     ${updatedUser.role}`);
  console.log(`Status:   ${updatedUser.status}`);
  console.log(
    `Verified: ${updatedUser.emailVerified ? "YES" : "NO"}`
  );
  console.log("");
  console.log("======================================");
  console.log("");
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
  });

