// import { trpcApiClient } from "@/common/trpc-api";

import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { DialogAddAppUser } from "@/components/dialog-add-app-user";
import { queryClient } from "@/query-client";

export const Route = createFileRoute("/_dashboard/personnel/app-users")({
  component: RouteComponent,
  loader: async () => {
    await queryClient.ensureQueryData(
      trpc.personnelPermission.getAppUserByPermission.queryOptions()
    );
  },
  pendingComponent: () => "loading...",
});

const TABS = [
  { key: "man-production" as const, label: "man-production" },
  { key: "ctr-gdstd" as const, label: "ctr-gdstd" },
  { key: "monitor-weight" as const, label: "monitor-weight" },
];

const USERS = {
  "man-production": ["User A", "User B"],
  "ctr-gdstd": ["User C", "User D"],
  "monitor-weight": ["User E", "User F"],
};

export function RouteComponent() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  const { data } = useSuspenseQuery(
    trpc.personnelPermission.getAppUserByPermission.queryOptions({
      permission: "monitor-weight",
    })
  );

  console.log(data);

  return (
    <div className="max-w-xl mt-10 p-6 bg-white rounded-lg shadow-lg grow">
      <div className="flex justify-end mb-6">
        <DialogAddAppUser />
      </div>
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 py-3 text-center font-medium transition-colors border-b-2 focus:outline-none ${
              activeTab === tab.key
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-gray-700 hover:text-blue-500"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        <ul className="list-none p-0">
          {USERS[activeTab].map((user) => (
            <li
              key={user}
              className="py-2 border-b border-gray-100 last:border-b-0"
            >
              {user}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
