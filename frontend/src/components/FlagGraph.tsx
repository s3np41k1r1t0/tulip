import { Service, Flow } from "../api";
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
import { END_FILTER_KEY, getTimeStuffFromParams, SERVICE_FILTER_KEY, START_FILTER_KEY } from "../utils";
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
}

export function FlowGraph({ service, flows, ticks }: FlowGraphProps) {
  function buildDataset(flows: Flow[], ticks: number[]) {
    const { tickToUnixTime } = getTimeStuffFromParams();
    
    if (ticks.length === 0) {
      return []
    }
    
    let idx = 1, dataset = Array(ticks.length).fill(0)
    for(const flow of flows.reverse()) {
      while (
        flow.time > Number(tickToUnixTime(ticks[idx])) && 
        idx <= ticks.length) {
        idx++;
      }
      dataset[idx-1]++;
    }
    
    return dataset
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

  const labels = ticks.map(tick => `Tick ${tick}`)  

  const [flowsIn, flowsOut] = flows
  

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
  }
  
  const chartRef = useRef<any>(), startTick = ticks[0];
  let [ searchParams, setSearchParams ] = useSearchParams();
  const { tickToUnixTime } = getTimeStuffFromParams();

  const onClick = (event: any) => {
    const element = getElementAtEvent(chartRef.current, event);
    
    if (element.length === 0) {
      return
    }
    
    const tick = startTick + element[0].index

    // Sadly cannot change selected tags in FlowList :^(
    let tag = null
    switch(element[0].datasetIndex) {
      case 0:
        tag = "flag-in"
        break
      case 1:
        tag = "flag-out"
        break
    }
    
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