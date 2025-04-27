// import { trpcApiClient } from "@/common/trpc-api";

import { DialogAddAppUser } from "@/components/dialog-add-app-user";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { DataTable } from "@/features/app-users/data-table";
import { columns } from "@/features/app-users/data-table/columns";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/personnel/app-users/")({
  component: RouteComponent,
  loader: async () => {
    console.log("??");
    await queryClient.ensureQueryData(
      trpc.personnelPermission.getAppUserByPermission.queryOptions({
        permission: "man-production",
      })
    );
  },
  pendingComponent: () => <Skeleton className="h-full" />,
});

const TABS = [
  { key: "man-production" as const, label: "man-production" },
  { key: "ctr-gdstd" as const, label: "ctr-gdstd" },
  { key: "monitor-weight" as const, label: "monitor-weight" },
];

export function RouteComponent() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  const { data, isLoading } = useQuery(
    trpc.personnelPermission.getAppUserByPermission.queryOptions({
      permission: activeTab,
    })
  );

  console.log(data);

  return (
    <div className="p-6 bg-white flex flex-col rounded-lg shadow-lg h-full">
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
      <div className="grow relative">
        <div className="absolute inset-0 ">
          {isLoading ? (
            <Skeleton className="h-full" />
          ) : (
            <ScrollArea className="rounded-md border p-0 h-full">
              {/* {Array(10)
                .fill(data)
                .flat()
                ?.map((user) => (
                  <li
                    key={user.id}
                    className="py-2 border-b border-gray-100 last:border-b-0"
                  >
                    {user.account}
                  </li>
                ))} */}
              <DataTable columns={columns} data={Array(10).fill(data).flat()} />
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
