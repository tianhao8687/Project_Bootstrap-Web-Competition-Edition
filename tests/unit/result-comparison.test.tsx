import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ResultComparison } from "../../src/components/ResultComparison";

describe("ResultComparison", () => {
  it("labels the direct output as an illustrative baseline and reveals the comparison", () => {
    render(<ResultComparison locale="zh-CN" />);
    expect(screen.getByText(/说明性基线/)).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    fireEvent.click(screen.getByText("对比一句话直出方案"));
    expect(screen.getByRole("heading", { name: "一句话直接生成" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Project Bootstrap" })).toBeInTheDocument();
    expect(screen.getByText("建议值单独标记并由用户确认")).toBeInTheDocument();
  });
});
