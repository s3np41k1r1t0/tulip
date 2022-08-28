import { Flow, useTulip } from "../api";
import { FlowGraph } from "../components/FlagGraph";
import { getTimeStuffFromParams } from "../utils";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SERVICE_FILTER_KEY } from "../utils";

export function GraphView() {
  const { services, getFlows } = useTulip();
  
  const { startTick, endTick, currentTick, tickToUnixTime } = getTimeStuffFromParams();
  let start = startTick ?? 0, end = endTick ?? Number(currentTick);
  
  // limit the size to not destroy chrome lmeow
  if (end - start > 20) {
    start = end - 20
  }

  const ticks = [...Array(end - start).keys()].map(i => i + start)
  
  // FIXME this could be avoided if FlowList saves the Flows internally
  // but maybe we would be limitated by the 2000 flows limit in the backend
  const [flowsIn, setFlowsIn] = useState<Flow[]>([]);
  
  useEffect(() => {
    let active = true
    getData()
    return () => { active = false }

    async function getData() { 
      const res = await getFlows({
        service: "", // FIXME
        from_time: String(tickToUnixTime(start)),
        to_time: String(tickToUnixTime(end)),
        tags: ["flag-in"],
      })
      if (!active) return
      setFlowsIn(res)
    }
  }, [start, end])

  const [flowsOut, setFlowsOut] = useState<Flow[]>([]);
  
  useEffect(() => {
    let active = true
    getData()
    return () => { active = false }

    async function getData() { 
      const res = await getFlows({
        service: "", // FIXME
        from_time: String(tickToUnixTime(start)),
        to_time: String(tickToUnixTime(end)),
        tags: ["flag-out"],
      })
      if (!active) return
      setFlowsOut(res)
    }
  }, [start, end])
    
  const graphs = services.filter(service => {
    const [ searchParams ] = useSearchParams();
    return !searchParams.has(SERVICE_FILTER_KEY) || service.name === searchParams.get(SERVICE_FILTER_KEY);
  }).map(service => 
    <Suspense key={service.name}>
      <FlowGraph 
        service={service} 
        ticks={ticks} 
        flows={[
          flowsIn.filter(flow => flow.dst_port === service.port), 
          flowsOut.filter(flow => flow.dst_port === service.port)
        ]} 
      />
    </Suspense>
  )
  
  return (
    <div>
      {graphs}
    </div>
  );
}