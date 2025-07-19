#!/usr/bin/env node

/**
 * Environment Setup Script for WorkTrackr
 *
 * This script helps developers set up their environment variables
 * by copying the appropriate template and prompting for required values.
 */

import fs from "fs";
import path from "path";
import readline from "readline";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupEnvironment() {
  log("\n🌍 WorkTrackr Environment Setup", "cyan");
  log("================================\n", "cyan");

  // Check if .env already exists
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const overwrite = await question(
      `${colors.yellow}⚠️  .env file already exists. Overwrite? (y/N): ${colors.reset}`
    );

    if (overwrite.toLowerCase() !== "y" && overwrite.toLowerCase() !== "yes") {
      log("\n❌ Setup cancelled.", "red");
      rl.close();
      return;
    }
  }

  // Choose environment template
  log("\n📋 Choose your environment template:", "blue");
  log("1. Development (recommended for local development)", "green");
  log("2. Staging (for testing)", "yellow");
  log("3. Production (for production deployment)", "red");
  log("4. Custom (manual setup)", "magenta");

  const templateChoice = await question("\nEnter your choice (1-4): ");

  let templateFile;
  switch (templateChoice) {
    case "1":
      templateFile = "env.development";
      break;
    case "2":
      templateFile = "env.staging";
      break;
    case "3":
      templateFile = "env.production";
      break;
    case "4":
      templateFile = "env.example";
      break;
    default:
      log("\n❌ Invalid choice. Using development template.", "red");
      templateFile = "env.development";
  }

  // Copy template
  const templatePath = path.join(process.cwd(), templateFile);
  if (!fs.existsSync(templatePath)) {
    log(`\n❌ Template file ${templateFile} not found!`, "red");
    rl.close();
    return;
  }

  const templateContent = fs.readFileSync(templatePath, "utf8");
  fs.writeFileSync(envPath, templateContent);

  log(`\n✅ Created .env file from ${templateFile} template`, "green");

  // Prompt for required variables
  log("\n🔧 Configure required environment variables:", "blue");

  const requiredVars = [
    {
      key: "VITE_SUPABASE_URL",
      description: "Supabase project URL",
      example: "https://your-project.supabase.co",
    },
    {
      key: "VITE_SUPABASE_ANON_KEY",
      description: "Supabase anonymous key",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
  ];

  let envContent = templateContent;

  for (const variable of requiredVars) {
    log(`\n${colors.cyan}${variable.description}${colors.reset}`);
    log(`Example: ${colors.yellow}${variable.example}${colors.reset}`);

    const value = await question(`Enter ${variable.key}: `);

    if (value.trim()) {
      // Replace the placeholder value
      const regex = new RegExp(`^${variable.key}=.*$`, "m");
      envContent = envContent.replace(regex, `${variable.key}=${value.trim()}`);
    }
  }

  // Write updated content
  fs.writeFileSync(envPath, envContent);

  log("\n✅ Environment setup complete!", "green");
  log("\n📝 Next steps:", "blue");
  log(
    "1. Review your .env file and update any other variables as needed",
    "cyan"
  );
  log('2. Run "npm run dev" to start the development server', "cyan");
  log(
    "3. Check the ENVIRONMENT.md file for detailed configuration options",
    "cyan"
  );

  // Show current configuration
  log("\n📊 Current Configuration:", "blue");
  const currentEnv = fs.readFileSync(envPath, "utf8");
  const appName = currentEnv.match(/VITE_APP_NAME=(.+)/)?.[1] || "Not set";
  const appEnv = currentEnv.match(/VITE_APP_ENV=(.+)/)?.[1] || "Not set";
  const supabaseUrl =
    currentEnv.match(/VITE_SUPABASE_URL=(.+)/)?.[1] || "Not set";

  log(`App Name: ${colors.green}${appName}${colors.reset}`);
  log(`Environment: ${colors.green}${appEnv}${colors.reset}`);
  log(`Supabase URL: ${colors.green}${supabaseUrl}${colors.reset}`);

  rl.close();
}

// Handle script errors
process.on("uncaughtException", (err) => {
  log(`\n❌ Error: ${err.message}`, "red");
  process.exit(1);
});

// Run setup
setupEnvironment().catch((err) => {
  log(`\n❌ Setup failed: ${err.message}`, "red");
  process.exit(1);
});
