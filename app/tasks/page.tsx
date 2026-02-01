import { TaskBoard } from "@/components/task-board";

// Mock tasks
const mockTasks = [
  {
    id: "1",
    title: "Setup Convex backend schema",
    status: "done" as const,
    priority: "high" as const,
    assigneeId: "sam",
    assigneeName: "Sam",
    assigneeAvatar: "SM",
    labels: ["backend", "infrastructure"],
  },
  {
    id: "2",
    title: "Build agent card component",
    status: "done" as const,
    priority: "medium" as const,
    assigneeId: "leo",
    assigneeName: "Leo",
    assigneeAvatar: "LO",
    labels: ["frontend", "ui"],
  },
  {
    id: "3",
    title: "Implement task board Kanban view",
    status: "in_progress" as const,
    priority: "high" as const,
    assigneeId: "leo",
    assigneeName: "Leo",
    assigneeAvatar: "LO",
    labels: ["frontend", "ui"],
  },
  {
    id: "4",
    title: "Design activity feed timeline",
    status: "in_progress" as const,
    priority: "medium" as const,
    assigneeId: "leo",
    assigneeName: "Leo",
    assigneeAvatar: "LO",
    labels: ["frontend", "design"],
  },
  {
    id: "5",
    title: "Add agent heartbeat tracking",
    status: "todo" as const,
    priority: "high" as const,
    assigneeId: "backend",
    assigneeName: "Backend",
    assigneeAvatar: "BE",
    labels: ["backend", "monitoring"],
  },
  {
    id: "6",
    title: "Create task assignment flow",
    status: "todo" as const,
    priority: "medium" as const,
    assigneeAvatar: "SM",
    labels: ["feature"],
  },
  {
    id: "7",
    title: "Implement real-time updates",
    status: "backlog" as const,
    priority: "high" as const,
    labels: ["backend", "realtime"],
  },
  {
    id: "8",
    title: "Add task filtering and search",
    status: "backlog" as const,
    priority: "low" as const,
    labels: ["frontend", "enhancement"],
  },
  {
    id: "9",
    title: "Setup user authentication",
    status: "backlog" as const,
    priority: "medium" as const,
    labels: ["backend", "security"],
  },
];

export default function TasksPage() {
  return (
    <div className="h-full bg-black p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-50">Tasks</h1>
        <p className="text-sm text-zinc-500">Track and manage team tasks</p>
      </div>
      <TaskBoard tasks={mockTasks} />
    </div>
  );
}
