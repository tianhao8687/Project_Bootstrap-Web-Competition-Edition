import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ResearchPage } from "../../src/pages/ResearchPage";
import { demoResearch } from "../../src/lib/demo";

describe("ResearchPage evidence review", () => {
  it("shows all four assessment groups and exposes evidence for important judgments", () => {
    const research = demoResearch("en");
    research.repositories[0]!.license = { status: "missing" };
    render(<ResearchPage locale="en" research={research} busy={false} onApply={vi.fn()} onSkip={vi.fn()} />);

    expect(screen.getByRole("heading", { name: "Current advantages" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Clear weaknesses" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Reusable ideas" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Differentiation guidance" })).toBeInTheDocument();
    expect(screen.getAllByText("Confirmed capabilities")).toHaveLength(4);
    expect(screen.getByText("No license detected · do not reuse code")).toBeInTheDocument();
    expect(screen.getByText("License labels are automated detection and general guidance, not legal advice.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "langchain-ai/langchain" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "run-llama/llama_index" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "pgvector/pgvector" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "deepset-ai/haystack" })).toBeInTheDocument();

    const evidenceControls = screen.getAllByText(/^View evidence ·/);
    expect(evidenceControls.length).toBeGreaterThanOrEqual(6);
    fireEvent.click(evidenceControls[0]!);
    expect(screen.getAllByText("pgvector/pgvector:README").length).toBeGreaterThan(0);
  });
});
