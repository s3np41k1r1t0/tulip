import { Service, Flow } from "../types";
import { Bar, getElementAtEvent } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { END_FILTER_KEY, SERVICE_FILTER_KEY, START_FILTER_KEY } from "../const";
import { TICK_REFETCH_INTERVAL_MS } from "../const";
import { useGetTickInfoQuery } from "../api";
import { useRef } from "react";
import { useSearchParams } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FlowGraphProps {
  service: Service
  flows: Flow[][],
  ticks: number[]
};

export function FlowGraph({ service, flows, ticks }: FlowGraphProps) {
  // TODO hack
  const { data: tickInfoData } = useGetTickInfoQuery(undefined, {
    pollingInterval: TICK_REFETCH_INTERVAL_MS,
  });
  
  const startDate = new Date(tickInfoData?.startDate ?? "1970-01-01T00:00:00Z").valueOf(); 
  const tickLength = tickInfoData?.tickLength ?? 1000; 

  function buildDataset(flows: Flow[], ticks: number[]) {
    if (ticks.length === 0) {
      return [];
    }
    
    const dataset = Array(ticks.length).fill(0);
    flows.forEach(flow => {
      const pos = Math.floor((flow.time - startDate) / tickLength) - ticks[0];
      if (pos >= 0 && pos < ticks.length) {
        dataset[pos]++;
      }
    });
    
    return dataset;
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const
      },
      title: {
        display: true,
        text: `${service.name} - Port: ${service.port}`
      }
    }
  };

  const labels = ticks.map(tick => `Tick ${tick}`);  

  const [flowsIn, flowsOut] = flows;

  const data = {
    labels,
    datasets: [
      {
        label: "Flag In",
        data: buildDataset(flowsIn, ticks),
        // Hack for some reason Tag::tagToColor doesnt show the correct colors ¯\_(ツ)_/¯
        backgroundColor: "rgba(0, 120, 255, 0.5)"
      },
      {
        label: "Flag Out",
        data: buildDataset(flowsOut, ticks),
        backgroundColor: "rgba(0, 255, 0, 0.5)"
      },
    ]
  };
  
  const chartRef = useRef<any>(), startTick = ticks[0];
  let [ searchParams, setSearchParams ] = useSearchParams();
  
  function tickToUnixTime(tick: number): number {
    return startDate + tick * tickLength;
  }

  const onClick = (event: any) => {
    const element = getElementAtEvent(chartRef.current, event);
    
    if (element.length === 0) {
      return;
    }
    
    const tick = startTick + element[0].index;

    const utStart = tickToUnixTime(tick), utEnd = tickToUnixTime(tick + 1);
    
    searchParams.set(SERVICE_FILTER_KEY, service.name);
    if (utStart) {
      searchParams.set(START_FILTER_KEY, utStart.toString());
    }
    if (utEnd) {
      searchParams.set(END_FILTER_KEY, utEnd.toString());
    }
    setSearchParams(searchParams)
  }

  return (
    <Bar options={options} data={data} ref={chartRef} onClick={onClick} />
  );
}