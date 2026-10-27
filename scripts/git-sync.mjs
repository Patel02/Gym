import { execSync } from "child_process";

function run(cmd) {
  try {
    return execSync(cmd, { stdio: "inherit" });
  } catch (err) {
    console.error(`Command failed: ${cmd}`, err.message);
    process.exit(1);
  }
}

console.log("\n=======================================================");
console.log("🚀 AUTO-SYNCING REPOSITORY TO GITHUB (Patel02/Gym)");
console.log("=======================================================\n");

const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
const commitMsg = process.argv.slice(2).join(" ") || `auto-sync: update project (${timestamp})`;

console.log("📦 1. Staging all modified and new files...");
run("git add .");

console.log(`📝 2. Committing changes: "${commitMsg}"...`);
try {
  execSync(`git commit -m "${commitMsg}"`, { stdio: "inherit" });
} catch {
  console.log("ℹ️  No changes to commit. Working tree is already clean.");
}

console.log("⬆️  3. Pushing directly to GitHub (origin/main)...");
run("git push origin main");

console.log("\n✅ SUCCESS! All changes are live on: https://github.com/Patel02/Gym\n");
