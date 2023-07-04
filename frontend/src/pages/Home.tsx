import { useAtom } from "jotai";
import { tickLengthInMs, ctfStartTime } from "../utils";

function TickLengthSettings() {
  const [tickLength, updateTickLength] = useAtom(tickLengthInMs);
  return (
    <div>
      <label>Length of a tick in ms: </label>
      <input
        value={tickLength}
        type="number"
        onChange={(ev) => {
          updateTickLength(parseInt(ev.target.value));
        }}
      ></input>
    </div>
  );
}

function CTFStartSettings() {
  const [startDate, updateStartDate] = useAtom(ctfStartTime);
  return (
    <div>
      <label>Start time of the CTF: </label>
      <input
        value={startDate}
        type="datetime-local"
        onChange={(ev) => {
          updateStartDate(ev.target.value);
        }}
      ></input>
    </div>
  );
}

export function Home() {
  return (
    <div className="p-4 flex flex-col gap-4 justify-center items-center h-full opacity-40">
      <span className="text-9xl">🌷</span>
      <h1 className="text-5xl text-gray-600">Welcome to Tulip</h1>

      {/* <h1 className="text-3xl font-bold pt-2 pb-4"></h1> */}
    </div>
  );
}
