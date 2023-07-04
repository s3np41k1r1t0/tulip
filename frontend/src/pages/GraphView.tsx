import { useGetFlowsQuery, useGetServicesQuery } from "../api";
import { useAppSelector } from "../store";
import { TEXT_FILTER_KEY, START_FILTER_KEY, END_FILTER_KEY, SERVICE_FILTER_KEY, FLOW_LIST_REFETCH_INTERVAL_MS, TICK_REFETCH_INTERVAL_MS } from "../const";
import { useGetTickInfoQuery } from "../api";
import { FlowGraph } from "../components/FlagGraph";
import { Suspense } from "react";
import { useSearchParams } from "react-router-dom";
import useDebounce from "../hooks/useDebounce";

export function GraphView() {

  const { data: services } = useGetServicesQuery();
  const filterTags = useAppSelector((state) => state.filter.filterTags);

  const [searchParams, setSearchParams] = useSearchParams();

  const service_name = searchParams.get(SERVICE_FILTER_KEY) ?? "";
  const service = services && services.find((s) => s.name == service_name);

  const text_filter = searchParams.get(TEXT_FILTER_KEY) ?? undefined;
  const from_filter = searchParams.get(START_FILTER_KEY) ?? undefined;
  const to_filter = searchParams.get(END_FILTER_KEY) ?? undefined;

  const debounced_text_filter = useDebounce(text_filter, 300);
  
  // TODO hack
  const { data: tickInfoData } = useGetTickInfoQuery(undefined, {
    pollingInterval: TICK_REFETCH_INTERVAL_MS,
  });
  
  const startDate = new Date(tickInfoData?.startDate ?? "1970-01-01T00:00:00Z").valueOf(); 
  const tickLength = tickInfoData?.tickLength ?? 1000; 
  
  function unixTimeToTick(unixTime: string | undefined): number {
    if (unixTime === undefined) {
      return 0;
    }
    let unixTimeInt = parseInt(unixTime);
    if (isNaN(unixTimeInt)) {
      return 0;
    }
    const tick = Math.floor(
      (unixTimeInt - new Date(startDate).valueOf()) / tickLength
    );

    return tick;
  }

  let start = unixTimeToTick(from_filter) ?? 0, end = unixTimeToTick(to_filter ?? new Date().toISOString());

  if (end < start) {
    end = start + 20;
  }
  
  // limit the size to not destroy chrome lmeow
  if (end - start > 20) {
    start = end - 20;
  }

  const ticks = [...Array(end - start).keys()].map(i => i + start);
  
  const { data: flowData, isLoading } = useGetFlowsQuery(
    {
      "flow.data": debounced_text_filter,
      dst_ip: service?.ip,
      dst_port: service?.port,
      from_time: from_filter,
      to_time: to_filter,
      service: "", // FIXME
      tags: filterTags,
    },
    {
      refetchOnMountOrArgChange: true,
      pollingInterval: FLOW_LIST_REFETCH_INTERVAL_MS,
    }
  );
  
  const flowsIn = flowData?.filter(flow => flow.tags.includes("flag-in")) ?? [];
  const flowsOut = flowData?.filter(flow => flow.tags.includes("flag-out")) ?? [];

  const graphs = services?.filter(
      service => !searchParams.has(SERVICE_FILTER_KEY) || service.name === searchParams.get(SERVICE_FILTER_KEY)
    ).map(service => 
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
  );
  
  return (
    <div>
      {graphs}
    </div>
  );
}