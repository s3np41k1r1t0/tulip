import { format, parse } from "date-fns";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Suspense } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Service, useTulip } from "../api";
import { getTimeStuffFromParams } from "../utils";

import {
  END_FILTER_KEY,
  SERVICE_FILTER_KEY,
  START_FILTER_KEY,
  TEXT_FILTER_KEY,
} from "../App";

export const showHexAtom = atomWithStorage("showHex", false);

// Hack to force refres sidebar
export const lastRefreshAtom = atom(Date.now());

function ServiceSelection() {
  const FILTER_KEY = SERVICE_FILTER_KEY;

  // TODO add all, maybe user react-select

  const { api, services } = useTulip();

  const service_select = [
    {
      ip: "",
      port: 0,
      name: "all",
    },
    ...services,
  ];
  let [searchParams, setSearchParams] = useSearchParams();
  console.log(...searchParams.entries(), service_select);
  return (
    <select
      value={searchParams.get(FILTER_KEY) ?? ""}
      onChange={(event) => {
        let serviceFilter = event.target.value;
        if (serviceFilter && serviceFilter != "all") {
          searchParams.set(FILTER_KEY, serviceFilter);
        } else {
          searchParams.delete(FILTER_KEY);
        }
        setSearchParams(searchParams);
      }}
    >
      {service_select.map((service) => (
        <option key={service.name} value={service.name}>
          {service.name}
        </option>
      ))}
    </select>
  );
}

function TextSearch() {
  const FILTER_KEY = TEXT_FILTER_KEY;
  let [searchParams, setSearchParams] = useSearchParams();
  return (
    <div>
      <input
        type="text"
        placeholder="regex"
        value={searchParams.get(FILTER_KEY) || ""}
        onChange={(event) => {
          let textFilter = event.target.value;
          if (textFilter) {
            searchParams.set(FILTER_KEY, textFilter);
          } else {
            searchParams.delete(FILTER_KEY);
          }
          setSearchParams(searchParams);
        }}
      ></input>
    </div>
  );
}


function StartDateSelection() {
  const { setTimeParam, startTick } = getTimeStuffFromParams();

  return (
    <div>
      <input
        className="w-20"
        type="number"
        placeholder="from"
        value={startTick}
        onChange={(event) => {
          setTimeParam(event.target.value, START_FILTER_KEY);
        }}
      ></input>
    </div>
  );
}

function EndDateSelection() {
  const { setTimeParam, endTick } = getTimeStuffFromParams();

  return (
    <div>
      <input
        className="w-20"
        type="number"
        placeholder="to"
        value={endTick}
        onChange={(event) => {
          setTimeParam(event.target.value, END_FILTER_KEY);
        }}
      ></input>
    </div>
  );
}

function ShowHexToggle() {
  const [showHex, setShowHex] = useAtom(showHexAtom);

  return (
    <div className="flex items-baseline mx-4">
      <input
        type="checkbox"
        className="mr-2"
        checked={showHex}
        onChange={() => {
          setShowHex(!showHex);
        }}
      />
      <label htmlFor="">Hexdump</label>
    </div>
  );
}

export function Header() {
  let [searchParams] = useSearchParams();
  const { setToLastnTicks, currentTick } = getTimeStuffFromParams();

  const [lastRefresh, setLastRefresh] = useAtom(lastRefreshAtom);

  return (
    <>
      <Link to={`/?${searchParams}`}>
        <div className="header-icon-left">🌷</div>
      </Link>
      <Link to={`/graph?${searchParams}`}>
        <div className="header-icon-right">📊</div>
      </Link>
      <div>
        <TextSearch></TextSearch>
      </div>
      <div>
        <Suspense>
          <ServiceSelection></ServiceSelection>
        </Suspense>
      </div>
      <div>
        <StartDateSelection></StartDateSelection>
      </div>
      <div>
        <EndDateSelection></EndDateSelection>
      </div>
      <div>
        <button
          className=" bg-amber-100 text-gray-800 rounded-md px-2 py-1"
          onClick={() => {
            setToLastnTicks(5);
            setLastRefresh(Date.now());
          }}
        >
          Last 5 ticks
        </button>
      </div>
      <div className="ml-auto mr-4">Current: {currentTick}</div>

      {/* <div className="ml-auto">
        <ShowHexToggle></ShowHexToggle>
      </div> */}
    </>
  );
}
