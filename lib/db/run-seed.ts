import dotenv from "dotenv";

// Load environment variables from .env.local before importing database files
dotenv.config({ path: ".env.local" });

console.log("Initializing database seed...");

async function main() {
  // Dynamically import seed to prevent TS hoisting from executing the DB connection too early
  const { seedDemoData } = await import("./seed");
  await seedDemoData();
}

main()
  .then(() => {
    console.log("Database seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database seeding failed:", error);
    process.exit(1);
  });
