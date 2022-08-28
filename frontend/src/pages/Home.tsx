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
    <div className="p-4">
      <h1 className="text-3xl font-bold pt-2 pb-4">Welcome to 🌷</h1>
      <div>
        <h2 className="text-lg">Settings</h2>
        <div>
          <TickLengthSettings></TickLengthSettings>
          <CTFStartSettings></CTFStartSettings>
        </div>
      </div>
    </div>
  );
}
