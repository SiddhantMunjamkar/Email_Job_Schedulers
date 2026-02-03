import { RotateCw, Search } from "lucide-react";

import { Funnel } from "lucide-react";
import { SearchbarInput } from "../ui/searchbar-input";

export function Topbar() {
  return (
    <div className="pt-4 px-6 flex items-center gap-5 pb-2 rounded-b-lg bg-white ">
      {/* Search bar */}
      <div className="flex-1 max-w-2xl">
        <SearchbarInput placeholder="Search" />
      </div>
      {/* filter icon  & rollback*/}
      <div className="flex items-center gap-5">
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <Funnel className="w-5 h-5 text-gray-500" />
        </button>
        <button className="p-1 hover:bg-gray-100 rounded transition-colors">
          <RotateCw className="w-5 h-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
}
