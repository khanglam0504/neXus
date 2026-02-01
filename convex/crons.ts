import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Sync Linear issues every 2 minutes
crons.interval(
  "sync-linear",
  { minutes: 2 },
  internal.linearSync.syncAll,
  {}
);

export default crons;
