import { Flow, useTulip } from "../api";
import { FlowGraph } from "../components/FlagGraph";
import { getTimeStuffFromParams } from "../utils";
import { Suspense, useRef } from "react";

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
  const flowsIn  = useRef<Flow[]>([]);
  (async (flowsIn) => 
    flowsIn.current = await getFlows({
      service: "", // FIXME
      from_time: String(tickToUnixTime(start)),
      to_time: String(tickToUnixTime(end)),
      tags: ["flag-in"],
    })
  )(flowsIn)

  const flowsOut = useRef<Flow[]>([]);
  (async (flowsOut) => 
    flowsOut.current = await getFlows({
      service: "", // FIXME
      from_time: String(tickToUnixTime(start)),
      to_time: String(tickToUnixTime(end)),
      tags: ["flag-out"],
    })
  )(flowsOut)
    
  const graphs = services.map(service => 
  <Suspense key={service.name}>
    <FlowGraph 
      service={service} 
      ticks={ticks} 
      flows={[
        flowsIn.current.filter(flow => flow.dst_port === service.port), 
        flowsOut.current.filter(flow => flow.dst_port === service.port)
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