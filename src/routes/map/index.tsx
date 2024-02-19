import { component$, useVisibleTask$ } from "@builder.io/qwik";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";

export default component$(() => {
  return (
    <div class="grid flex-1 place-items-center">
      <h1 class="pb-24 text-4xl font-semibold">Coming Soon</h1>
    </div>
  );
});

const GlobeVis = component$(() => {
  useVisibleTask$(() => {
    const root = am5.Root.new("chart-div");

    const chart = am5percent.PieChart.new(root, {});
    root.container.children.push(chart);
  });
  return <div id="chart-div"></div>;
});
