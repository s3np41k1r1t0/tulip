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
import { ChartJSOrUndefined } from "react-chartjs-2/dist/types";
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
  const [ searchParams, setSearchParams ] = useSearchParams();
  const { setTimeParam } = getTimeStuffFromParams();

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
    
    searchParams.set(SERVICE_FILTER_KEY, service.name);
    setSearchParams(searchParams)

    setTimeParam(tick.toString(), START_FILTER_KEY);
    setTimeParam((tick + 1).toString(), END_FILTER_KEY);
  }

  return (
    <Bar options={options} data={data} ref={chartRef} onClick={onClick} />
  );
}