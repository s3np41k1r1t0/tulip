import { Service, Flow } from "../api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { getTimeStuffFromParams } from "../utils";

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
  // console.log(`FlowsOut: ${flowsOut}`)
  // console.log(`dataset ${buildDataset(flowsIn, ticks)}`)
  

  const data = {
    labels,
    datasets: [
      {
        label: "Flag In",
        // maybe replace this with count call in the backend
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

  return (
    <Bar options={options} data={data} />
  );
}