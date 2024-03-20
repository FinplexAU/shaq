import { component$, useVisibleTask$ } from "@builder.io/qwik";
import * as am5 from "@amcharts/amcharts5";
import am5geodata_worldLow from "@amcharts/amcharts5-geodata/worldLow";
import * as am5map from "@amcharts/amcharts5/map";
import colors from "tailwindcss/colors";
import rawShipData from "@/public/ship-data.json";
import { routeLoader$ } from "@builder.io/qwik-city";

export const useShipData = routeLoader$(async () => {
	return rawShipData;
});

export default component$(() => {
	return <GlobeVis></GlobeVis>;
});

const GlobeVis = component$(() => {
	const data = useShipData();
	// eslint-disable-next-line qwik/no-use-visible-task
	useVisibleTask$(({ cleanup }) => {
		console.log(data.value);
		const root = am5.Root.new("chart-div");
		const chart = root.container.children.push(
			am5map.MapChart.new(root, {
				panX: "rotateX",
			})
		);

		root.container.children.push(chart);

		chart.series.push(
			am5map.MapPolygonSeries.new(root, {
				geoJSON: am5geodata_worldLow,
				exclude: ["AQ"],
				fill: am5.color(colors.slate[200]),
				stroke: am5.color(colors.slate[400]),
			})
		);

		const pointSeries = chart.series.push(am5map.MapPointSeries.new(root, {}));

		pointSeries.bullets.push(function () {
			const sprite = am5.Circle.new(root, {
				radius: 7,
				tooltipY: 0,
				fill: am5.color(0xffba00),
				tooltipText: "{title}",
			});

			return am5.Bullet.new(root, {
				sprite,
			});
		});

		const coords = data.value.features[0]?.geometry.coordinates[0];

		if (coords) {
			pointSeries.data.push({
				geometry: {
					type: "Point",
					coordinates: coords[coords.length - 1],
				},
				title: data.value.properties.vessel.name,
			});
		}

		chart.appear(1000, 100);

		cleanup(() => {
			root.dispose();
		});
	});
	return <div class="h-full w-full flex-1" id="chart-div"></div>;
});
