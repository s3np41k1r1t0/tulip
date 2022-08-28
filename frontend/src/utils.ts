import { useSearchParams } from "react-router-dom";
import { atomWithStorage } from "jotai/utils";
import { useAtom } from "jotai";

export const TEXT_FILTER_KEY = "text";
export const SERVICE_FILTER_KEY = "service";
export const START_FILTER_KEY = "start";
export const END_FILTER_KEY = "end";


// Do not commit this
export const tickLengthInMs = atomWithStorage<number>("tickLengthInMs", /*2 * 60 * */ 1000);
export const ctfStartTime = atomWithStorage<string>(
  "ctfStartTime2",
  // "2022-07-16T09:00+03:00"
  "2018-06-27T12:25+01:00"
);

// Abstraction so we can maybe get this data from the server in the future
export const useCTF = function () {
  const [tickLength, updateTickLength] = useAtom(tickLengthInMs);
  const [startDate, updateStartDate] = useAtom(ctfStartTime);
  console.log(startDate, tickLength);

  return { tickLength, startDate };
};

export function getTimeStuffFromParams() {
  let [searchParams, setSearchParams] = useSearchParams();

  const { startDate, tickLength } = useCTF();

  function setTimeParam(startTick: string, param: string) {
    const parsedTick = startTick === "" ? undefined : parseInt(startTick);
    const unixTime = tickToUnixTime(parsedTick);
    if (unixTime) {
      searchParams.set(param, unixTime.toString());
    } else {
      searchParams.delete(param);
    }
    setSearchParams(searchParams);
  }

  const startTimeParamUnix = searchParams.get(START_FILTER_KEY);
  const endTimeParamUnix = searchParams.get(END_FILTER_KEY);

  function unixTimeToTick(unixTime: string | null): number | undefined {
    if (unixTime === null) {
      return;
    }
    let unixTimeInt = parseInt(unixTime);
    if (isNaN(unixTimeInt)) {
      return;
    }
    const tick = Math.floor(
      (unixTimeInt - new Date(startDate).valueOf()) / tickLength
    );

    return tick;
  }

  function tickToUnixTime(tick?: number) {
    if (!tick) {
      return;
    }
    const unixTime = new Date(startDate).valueOf() + tickLength * tick;
    return unixTime;
  }

  const startTick = unixTimeToTick(startTimeParamUnix);
  const endTick = unixTimeToTick(endTimeParamUnix);
  const currentTick = unixTimeToTick(new Date().valueOf().toString());

  function setToLastnTicks(n: number) {
    const startTick = (currentTick ?? 0) - n;
    const endTick = (currentTick ?? 0) + 1; // to be sure
    setTimeParam(startTick.toString(), START_FILTER_KEY);
    setTimeParam(endTick.toString(), END_FILTER_KEY);
  }

  return {
    unixTimeToTick,
    tickToUnixTime,
    startDate,
    tickLength,
    setTimeParam,
    startTick,
    endTick,
    currentTick,
    setToLastnTicks,
  };
}
