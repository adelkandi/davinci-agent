import { getSupabaseAdmin } from "@/services/supabase-client";
import { Job, jobFromRow, jobRowSchema } from "@/types/job";

export const dynamic = "force-dynamic";

interface RecentEvent {
  id: string;
  jobId: string | null;
  eventType: string;
  tool: string | null;
  status: string;
  outputSummary: string | null;
  createdAt: string;
}

async function getRecentJobs(): Promise<Job[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(20);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => jobFromRow(jobRowSchema.parse(row)));
}

async function getRecentEvents(): Promise<RecentEvent[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("agent_events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) throw new Error(error.message);
  return (data ?? []).map((row) => ({
    id: row.id,
    jobId: row.job_id,
    eventType: row.event_type,
    tool: row.tool,
    status: row.status,
    outputSummary: row.output_summary,
    createdAt: row.created_at,
  }));
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-gray-100 text-gray-700",
  QUALIFYING: "bg-blue-100 text-blue-700",
  QUALIFIED: "bg-indigo-100 text-indigo-700",
  WAITING_FOR_CREW: "bg-amber-100 text-amber-700",
  ACCEPTED: "bg-emerald-100 text-emerald-700",
  CUSTOMER_NOTIFIED: "bg-green-100 text-green-700",
  HUMAN_REQUIRED: "bg-red-100 text-red-700",
  DECLINED: "bg-red-100 text-red-700",
  FAILED: "bg-red-100 text-red-700",
};

export default async function MissionControlPage() {
  let jobs: Job[] = [];
  let events: RecentEvent[] = [];
  let loadError: string | null = null;

  try {
    [jobs, events] = await Promise.all([getRecentJobs(), getRecentEvents()]);
  } catch (error) {
    loadError = error instanceof Error ? error.message : String(error);
  }

  return (
    <main className="min-h-screen p-6 text-sm text-gray-900">
      <h1 className="text-xl font-semibold mb-1">DaVinci — Mission Control</h1>
      <p className="text-gray-500 mb-4">Read-only operational view of recent jobs. Refresh to see updates.</p>

      {loadError && (
        <p className="text-red-600 mb-4">
          Failed to load jobs: {loadError}. Check SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY.
        </p>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">Status</th>
              <th className="p-2">Urgency</th>
              <th className="p-2">Customer</th>
              <th className="p-2">Service</th>
              <th className="p-2">Description</th>
              <th className="p-2">Address</th>
              <th className="p-2">Assigned</th>
              <th className="p-2">Updated</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id} className="border-b align-top">
                <td className="p-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_COLORS[job.status] ?? ""}`}>
                    {job.status}
                  </span>
                </td>
                <td className="p-2">{job.urgency}</td>
                <td className="p-2">{job.customerPhone}</td>
                <td className="p-2">{job.serviceType}</td>
                <td className="p-2 max-w-xs">{job.description ?? "—"}</td>
                <td className="p-2">{job.address ?? "—"}</td>
                <td className="p-2">{job.assignedWorker ?? "—"}</td>
                <td className="p-2 whitespace-nowrap">{new Date(job.updatedAt).toLocaleTimeString()}</td>
              </tr>
            ))}
            {jobs.length === 0 && !loadError && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={8}>
                  No jobs yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-2">Recent Agent Events</h2>
      <div className="overflow-x-auto border rounded">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="p-2">Time</th>
              <th className="p-2">Event</th>
              <th className="p-2">Tool</th>
              <th className="p-2">Status</th>
              <th className="p-2">Job</th>
              <th className="p-2">Summary</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b align-top">
                <td className="p-2 whitespace-nowrap">{new Date(event.createdAt).toLocaleTimeString()}</td>
                <td className="p-2">{event.eventType}</td>
                <td className="p-2">{event.tool ?? "—"}</td>
                <td className={`p-2 ${event.status === "failure" ? "text-red-600" : ""}`}>{event.status}</td>
                <td className="p-2 whitespace-nowrap">{event.jobId ? event.jobId.slice(0, 8) : "—"}</td>
                <td className="p-2 max-w-sm truncate">{event.outputSummary ?? "—"}</td>
              </tr>
            ))}
            {events.length === 0 && !loadError && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>
                  No events yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
