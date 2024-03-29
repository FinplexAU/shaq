import { component$, useVisibleTask$ } from "@builder.io/qwik";
import * as am5 from "@amcharts/amcharts5";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import * as am5map from "@amcharts/amcharts5/map";
import colors from "tailwindcss/colors";

export default component$(() => {
  return (
    <div class="grid flex-1 grid-cols-3 place-items-center  gap-4">
      <div class="col-span-2 h-full w-full ">
        <GlobeVis></GlobeVis>
      </div>
      <h1 class="mr-auto pb-24 text-center text-4xl font-semibold">
        Shipment Tracking <br /> Coming Soon
      </h1>
    </div>
  );
});

const GlobeVis = component$(() => {
  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const root = am5.Root.new("chart-div");
    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoOrthographic(),
        panX: "rotateX",
        panY: "rotateY",
        wheelX: "none",
        wheelY: "none",
        pinchZoom: true,
        paddingBottom: 50,
        paddingTop: 50,
      }),
    );

    // Create series for background fill
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
    const backgroundSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {}),
    );
    backgroundSeries.mapPolygons.template.setAll({
      fill: am5.color(colors.sky[700]),
      fillOpacity: 1,
      strokeOpacity: 0,
    });

    // Add background polygon
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/#Background_polygon
    backgroundSeries.data.push({
      geometry: am5map.getGeoRectangle(90, 180, -90, -180),
    });

    root.container.children.push(chart);

    chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        geoJSON: am5geodata_worldLow,
        fill: am5.color(colors.stone[200]),
        stroke: am5.color(colors.stone[400]),
      }),
    );

    // Create point series for markers
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-point-series/
    const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

    pointSeries.bullets.push(function () {
      const circle = am5.Triangle.new(root, {
        height: 15,
        width: 15,
        tooltipY: 0,
        fill: am5.color(0xffba00),
        tooltipText: "{title}",
      });

      return am5.Bullet.new(root, {
        sprite: circle,
      });
    });

    pointSeries.data.push({
      geometry: {
        type: "Point",
        coordinates: [-37.813629, 144.963058].reverse(),
      },
      title: "Melbourne",
    });

    chart.appear(1000, 100);

    cleanup(() => {
      root.dispose();
    });
  });
  return <div class="h-full w-full flex-1" id="chart-div"></div>;
});
