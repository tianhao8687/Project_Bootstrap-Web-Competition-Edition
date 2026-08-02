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
    expect(screen.getAllByText("Confirmed capabilities")).toHaveLength(3);
    expect(screen.getByText("No license detected · do not reuse code")).toBeInTheDocument();
    expect(screen.getByText("License labels are automated detection and general guidance, not legal advice.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "github/spec-kit" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "tianhao8687/project-bootstrap" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Fission-AI/OpenSpec" })).toBeInTheDocument();

    const evidenceControls = screen.getAllByText(/^View evidence ·/);
    expect(evidenceControls.length).toBeGreaterThanOrEqual(6);
    fireEvent.click(evidenceControls[0]!);
    expect(screen.getAllByText("tianhao8687/project-bootstrap:README").length).toBeGreaterThan(0);
  });
});
