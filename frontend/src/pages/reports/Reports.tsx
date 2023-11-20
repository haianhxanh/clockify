// import React, { useMemo } from "react";
// import { Bar } from "@visx/shape";
// import { Group } from "@visx/group";
// import { GradientTealBlue } from "@visx/gradient";
// import letterFrequency, {
//   LetterFrequency,
// } from "@visx/mock-data/lib/mocks/letterFrequency";
// import { scaleBand, scaleLinear } from "@visx/scale";

// const data = letterFrequency.slice(5);
// const verticalMargin = 120;

// // accessors
// const getLetter = (d: LetterFrequency) => d.letter;
// const getLetterFrequency = (d: LetterFrequency) => Number(d.frequency) * 100;

// export type BarsProps = {
//   width: number;
//   height: number;
//   events?: boolean;
// };

// export default function Reports({ width, height, events = false }: BarsProps) {
//   // bounds
//   const xMax = width;
//   const yMax = height - verticalMargin;

//   // scales, memoize for performance
//   const xScale = useMemo(
//     () =>
//       scaleBand<string>({
//         range: [0, xMax],
//         round: true,
//         domain: data.map(getLetter),
//         padding: 0.4,
//       }),
//     [xMax]
//   );
//   const yScale = useMemo(
//     () =>
//       scaleLinear<number>({
//         range: [yMax, 0],
//         round: true,
//         domain: [0, Math.max(...data.map(getLetterFrequency))],
//       }),
//     [yMax]
//   );

//   return width < 10 ? null : (
//     <svg width={width} height={height}>
//       <GradientTealBlue id="teal" />
//       <rect width={width} height={height} fill="url(#teal)" rx={14} />
//       <Group top={verticalMargin / 2}>
//         {data.map((d) => {
//           const letter = getLetter(d);
//           const barWidth = xScale.bandwidth();
//           const barHeight = yMax - (yScale(getLetterFrequency(d)) ?? 0);
//           const barX = xScale(letter);
//           const barY = yMax - barHeight;
//           return (
//             <Bar
//               key={`bar-${letter}`}
//               x={barX}
//               y={barY}
//               width={barWidth}
//               height={barHeight}
//               fill="rgba(23, 233, 217, .5)"
//               onClick={() => {
//                 if (events)
//                   alert(`clicked: ${JSON.stringify(Object.values(d))}`);
//               }}
//             />
//           );
//         })}
//       </Group>
//     </svg>
//   );
// }

import * as React from "react";
import { BarChart, BarPlot } from "@mui/x-charts/BarChart";
import { ChartContainer } from "@mui/x-charts/ChartContainer";
import { DataContext } from "@/context/DataContext";
import { useContext, useEffect, useState } from "react";
import {
  AllSeriesType,
  ChartsXAxis,
  ChartsYAxis,
  LinePlot,
} from "@mui/x-charts";

interface ProjectName {
  name: string;
}

interface ProjectHour {
  hours: number;
}

export default function Reports() {
  const { projects } = useContext(DataContext);
  const [projectNames, setProjectNames] = useState<ProjectName[]>([]);
  const [projectHours, setProjectHours] = useState<ProjectHour[]>([]);
  const [trackedHours, setTrackedHours] = useState<ProjectHour[]>([]);
  useEffect(() => {
    let projectNamesArr = [];
    let projectHoursArr = [];
    let trackedHoursArr = [];
    projects.map((project) => {
      projectNamesArr.push(project.name);
      projectHoursArr.push(project.total_allocated_hours);
      trackedHoursArr.push(project.tracked_hours);
    });
    setProjectNames(projectNamesArr);
    setProjectHours(projectHoursArr);
    setTrackedHours(trackedHoursArr);
  }, [projects]);

  const series = [
    {
      type: "bar",
      stack: "",
      yAxisKey: "total",
      data: trackedHours,
      label: "Tracked hours",
    },
    {
      type: "bar",
      stack: "",
      yAxisKey: "total",
      data: projectHours,
      label: "Allocated hours",
    },
  ] as AllSeriesType[];

  return (
    <ChartContainer
      series={series}
      width={1000}
      height={400}
      xAxis={[
        {
          id: "projects",
          data: projectNames,
          scaleType: "band",
        },
      ]}
      yAxis={[
        {
          id: "total",
          scaleType: "linear",
        },
      ]}
    >
      <BarPlot />
      <ChartsXAxis label="Projects" position="bottom" axisId="projects" />
      <ChartsYAxis label="Progress (Hrs)" position="left" axisId="total" />
    </ChartContainer>
  );
}
