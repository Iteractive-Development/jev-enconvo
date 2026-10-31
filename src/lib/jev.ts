import { NativeAPI } from "@enconvo/api";

/** Run an inline agent-workflow/v1 source and return its outputs map. */
export async function runWorkflow(
  source: string,
  inputs: Record<string, unknown> = {},
  timeoutMs = 180000
): Promise<Record<string, unknown>> {
  const start = await NativeAPI.localApi("workflow/run", {
    source,
    inputs,
    runtimeSource: "plugin_command",
    waitMs: 25000
  });
  if (!start.ok) {
    throw new Error(`workflow/run returned ${start.status}`);
  }
  let run = (await start.json()) as { runId?: string; status: string; outputs?: Record<string, unknown> };
  const deadline = Date.now() + timeoutMs;
  while (run.status === "running" && run.runId && Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const wait = await NativeAPI.localApi("workflow/wait", {
      runId: run.runId,
      timeoutMs: 15000
    });
    if (!wait.ok) {
      throw new Error(`workflow/wait returned ${wait.status}`);
    }
    run = (await wait.json()) as typeof run;
  }
  if (run.status !== "completed") {
    throw new Error(`workflow run ${run.status || "did not complete"}`);
  }
  return run.outputs ?? {};
}

export function outputString(outputs: Record<string, unknown>, key: string): string {
  const value = outputs[key];
  return typeof value === "string" ? value : JSON.stringify(value ?? null, null, 2);
}
