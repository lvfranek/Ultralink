// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import type { AnalyticsData } from "@/app/actions/analytics";
import { EXAMPLE_ANALYTICS_DATA } from "@/lib/analytics/example-data";
import { AnalyticsView } from "./analytics-view";

vi.mock("@/app/actions/analytics", () => ({ getAnalyticsData: vi.fn() }));

afterEach(cleanup);

describe("Activity chart", () => {
  it("keeps every line inside the chart, also when clicks outnumber views", () => {
    // Spiky days where clicks beat views, like a fan tapping several buttons
    const data: AnalyticsData = {
      ...EXAMPLE_ANALYTICS_DATA,
      timeseries: [0, 4, 0, 1, 0, 2, 1, 0, 3, 0].map((views, i) => ({
        date: `2026-09-${String(10 + i).padStart(2, "0")}`,
        views,
        clicks: [0, 6, 0, 0, 0, 7, 0, 0, 5, 0][i],
      })),
    };
    const { container } = render(
      <AnalyticsView pages={[{ id: "p1", slug: "mia", title: "Mia" }]} initialPage="all" exampleData={data} />,
    );

    const paths = [...container.querySelectorAll("[role=img] svg path")];
    expect(paths.length).toBeGreaterThan(0);
    for (const path of paths) {
      // Every coordinate pair is "x,y"; the chart's viewBox is 300 high, top = 0
      const ys = [...(path.getAttribute("d") ?? "").matchAll(/-?[\d.]+,(-?[\d.]+)/g)].map((m) => Number(m[1]));
      expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...ys)).toBeLessThanOrEqual(300);
    }
    // The axis reaches the highest click count (7), not just the views
    const top = container.querySelector("[class*=yLabel]:last-of-type")?.textContent;
    expect(Number(top)).toBeGreaterThanOrEqual(7);
  });
});
