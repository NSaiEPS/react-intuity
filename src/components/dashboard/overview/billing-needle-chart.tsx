// import React from 'react';
// import dynamic from 'next/dynamic';
// import { RootState } from '@/state/store';
// import { useSelector } from 'react-redux';

// const ApexCharts = dynamic(() => import('react-apexcharts'), {
//   ssr: false,
//   loading: () => <div>Loading chart...</div>,
// });

// const GaugeChart = () => {
//   const usageGraph = useSelector((state: RootState) => state?.DashBoard.usageGraph);

//   const value = usageGraph?.days_meter ?? 0;
//   const series = [value]; // value from 0 to 100

//   const options: any = {
//     chart: {
//       type: 'radialBar',
//       offsetY: -20,
//       sparkline: {
//         enabled: true,
//       },
//     },
//     plotOptions: {
//       radialBar: {
//         startAngle: -135,
//         endAngle: 135,
//         hollow: {
//           margin: 0,
//           size: '70%',
//           background: 'transparent',
//         },
//         track: {
//           background: '#f0f0f0',
//           startAngle: -135,
//           endAngle: 135,
//         },
//         dataLabels: {
//           show: false,
//         },
//       },
//     },
//     colors: [getColor(value)],
//     stroke: {
//       lineCap: 'round',
//     },
//     labels: [''],
//   };

//   return (
//     <div style={{ position: 'relative', width: 300, height: 200 }}>
//       <ApexCharts options={options} series={series} type="radialBar" height={250} />
//       {/* Needle */}
//       <div
//         style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           width: '8px',
//           height: '80px',
//           backgroundColor: 'black',
//           transformOrigin: 'bottom center',
//           transform: `translate(-50%, -100%) rotate(${mapToNeedleAngle(value)}deg)`,
//           borderRadius: '50px',
//         }}
//       />
//       {/* Center Circle */}
//       <div
//         style={{
//           position: 'absolute',
//           top: '50%',
//           left: '50%',
//           width: 20,
//           height: 20,
//           backgroundColor: 'black',
//           borderRadius: '50%',
//           transform: 'translate(-50%, -50%)',
//         }}
//       />
//       <div style={{ textAlign: 'center', marginTop: 20 }}>
//         <strong>{value}</strong> Estimated days remaining to pay
//       </div>
//     </div>
//   );
// };

// // Helper to get color based on value
// function getColor(val) {
//   if (val <= 30) return 'green';
//   if (val <= 70) return 'yellow';
//   return 'red';
// }

// // Convert value (0–100) to needle angle (-135 to 135)
// function mapToNeedleAngle(val) {
//   return (270 * val) / 100 - 135;
// }

// export default GaugeChart;

import React from "react";

import { RootState } from "@/state/store";
import { boarderRadius } from "@/utils";
import { Box, Card, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import Chart from "react-apexcharts";

import { TotalProfitProps } from "./total-profit";

// const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function GaugeChart({ sx }: TotalProfitProps) {
  const usageGraph = useSelector(
    (state: RootState) => state?.DashBoard.usageGraph
  );
  const value = usageGraph?.days_meter ?? 0;
  // const value = 30;

  // Convert value (0–30) to percentage for chart fill
  const percent = (value / 30) * 100;

  // const options: any = {
  //   chart: {
  //     height: 280,
  //     type: 'radialBar',
  //   },
  //   series: [percent],
  //   colors: ['#20E647'],
  //   plotOptions: {
  //     radialBar: {
  //       startAngle: -135,
  //       endAngle: 135,
  //       track: {
  //         background: '#ddd',
  //         startAngle: -135,
  //         endAngle: 135,
  //       },
  //       dataLabels: {
  //         name: { show: false },
  //         value: { show: false }, // hide % inside chart
  //       },
  //     },
  //   },
  //   fill: {
  //     type: 'gradient',
  //     gradient: {
  //       shade: 'dark',
  //       type: 'horizontal',
  //       gradientToColors: ['red'],
  //       stops: [0, 100],
  //     },
  //   },
  //   stroke: { lineCap: 'butt' },
  //   tooltip: {
  //     enabled: true,
  //     fillSeriesColor: false,
  //     y: {
  //       formatter: (val: number) => `${Math.round((val * 30) / 100)} days used`,
  //       title: {
  //         formatter: () => 'Usage',
  //       },
  //     },
  //   },
  // };

  const options: any = {
    chart: {
      height: 280,
      type: "radialBar",
    },
    series: [percent],
    colors: ["#20E647"],
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        track: {
          background: "#ddd",
          startAngle: -135,
          endAngle: 135,
        },
        dataLabels: {
          name: { show: false },
          // value: { show: false },
          value: {
            show: true,
            fontSize: "20px",
            fontWeight: 700,
            color: "#111",
            formatter: function (val: number) {
              const daysUsed = Math.round((val * 30) / 100);
              return `${daysUsed} days`;
            },
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "horizontal",
        gradientToColors: ["#FF0000"], // to red
        stops: [0, 50, 100],
        colorStops: [
          { offset: 0, color: "#20E647", opacity: 1 }, // green
          { offset: 50, color: "#FFD700", opacity: 1 }, // yellow
          { offset: 100, color: "#FF0000", opacity: 1 }, // red
        ],
      },
    },
    stroke: { lineCap: "butt" },
    tooltip: {
      enabled: true,
      fillSeriesColor: false,
      y: {
        formatter: (val: number) => `${Math.round((val * 30) / 100)} days `,
        title: {
          formatter: () => "Billing",
        },
      },
    },
  };

  return (
    <Card
      sx={{
        ...sx,

        borderRadius: boarderRadius.card,
      }}
    >
      <Box textAlign="center">
        <Chart
          options={options}
          series={[percent]}
          type="radialBar"
          height={280}
        />
        <Typography variant="h6" sx={{ fontWeight: 500 }} m={1}>
          {usageGraph?.days_remaining_text} Estimated days remaining to pay
        </Typography>
      </Box>
    </Card>
  );
}
