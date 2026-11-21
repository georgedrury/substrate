import { buildReport, findProjectRoot } from "../../commands/doctor.js";
import { runUpdate } from "../../commands/update.js";
function text(value, isError = false) {
    return {
        content: [{ type: "text", text: typeof value === "string" ? value : JSON.stringify(value, null, 2) }],
        ...(isError ? { isError: true } : {}),
    };
}
const NO_PROJECT = "No components.json found. Run `npx @substrate-kit/cli init` in the project first.";
export async function handleCheckComponents() {
    const root = findProjectRoot(process.cwd());
    if (!root)
        return text(NO_PROJECT, true);
    const report = await buildReport(root);
    if (!report.tracked) {
        return text("This project doesn't track its Substrate components yet (no substrate.lock.json). " +
            "Run `npx substrate-kit doctor --adopt` to start; their versions are then unknown until `update --force` refreshes them.");
    }
    if (!report.reachable) {
        return text("Could not load the Substrate registry, so nothing could be compared. Check the network connection.", true);
    }
    const needsAttention = report.items.filter((item) => item.status !== "ok");
    return text({
        upToDate: report.items.length - needsAttention.length,
        needsAttention,
        statuses: {
            behind: "The registry has changed since install and the file is untouched: update_components updates it.",
            modified: "Edited locally. Not replaced by update_components; the CLI's `update --force` replaces it after a backup.",
            "behind+modified": "Behind the registry and edited locally. Only the CLI's `update --force` replaces it, after a backup.",
            unknown: "Tracked without a known version. Only the CLI's `update --force` refreshes it, after a backup.",
        },
    });
}
export async function handleUpdateComponents(args) {
    const root = findProjectRoot(process.cwd());
    if (!root)
        return text(NO_PROJECT, true);
    // Never forced here: replacing edited files is a decision for a person, with the CLI
    const result = await runUpdate(root, args.components ?? [], { dryRun: args.dry_run, silent: true });
    switch (result.kind) {
        case "no-lock":
            return text("No substrate.lock.json yet. Run `npx substrate-kit doctor --adopt` first.", true);
        case "untracked":
            return text(`Not tracked: ${result.names.join(", ")}`, true);
        case "blocked":
            return text({ ...result, note: "These were edited or have an unknown version, so they were left alone. Use the CLI's `substrate-kit update --force <name>` to replace them; your files are backed up first." }, true);
        case "failed":
            return text("The update failed and the files were put back as they were.", true);
        default:
            return text(result);
    }
}
//# sourceMappingURL=project-components.js.map