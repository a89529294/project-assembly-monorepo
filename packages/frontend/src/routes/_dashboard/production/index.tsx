import { PageShell } from "@/components/layout/page-shell";
import { PendingComponent } from "@/components/pending-component";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useDeferredValue } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { SimpleProject } from "../../../../../backend/src/trpc/router";
import { z } from "zod";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_dashboard/production/")({
  validateSearch: z.object({
    customerId: z.string().default("all"),
    projectId: z.string().optional(),
  }),
  loader() {
    queryClient.ensureQueryData(
      trpc.basicInfo.readCustomers.queryOptions({
        page: 1,
        pageSize: 100,
      })
    );

    queryClient.ensureQueryData(
      trpc.production.readSimpleProjects.queryOptions(undefined)
    );
  },
  pendingComponent: PendingComponent,
  component: ProductionPage,
});

function ProductionPage() {
  // const [selectedCustomerId, setSelectedCustomerId] = useState("all");
  const { customerId, projectId } = Route.useSearch();
  const deferredCustomerId = useDeferredValue(customerId);
  const isFetchingProjects = customerId !== deferredCustomerId;
  // const [selectedProject, setSelectedProject] = useState<SimpleProject | null>(
  //   null
  // );
  const navigate = Route.useNavigate();

  // Fetch all customers for the dropdown
  const { data: customersData } = useSuspenseQuery(
    trpc.basicInfo.readCustomers.queryOptions({
      page: 1,
      pageSize: 100,
    })
  );

  const { data: projectsData } = useSuspenseQuery(
    trpc.production.readSimpleProjects.queryOptions(
      deferredCustomerId === "all" ? undefined : deferredCustomerId
    )
  );

  // Handle customer selection change
  const handleCustomerChange = (value: string) => {
    // setSelectedCustomerId(value);
    // setSelectedProject(null);
    navigate({
      search: {
        customerId: value,
        projectId: undefined,
      },
    });
  };

  // Handle project selection
  const handleProjectSelect = (project: SimpleProject) => {
    // setSelectedProject(project);
    navigate({
      search: {
        projectId: project.id,
        customerId: deferredCustomerId,
      },
    });
  };

  const selectedProject = projectsData.find((p) => p.id === projectId);

  return (
    <PageShell
      header={
        <div className="flex justify-between items-center w-full">
          <h1 className="text-2xl font-bold">Production Dashboard</h1>
          <div className="flex items-center gap-4">
            <Select
              onValueChange={handleCustomerChange}
              value={deferredCustomerId}
            >
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select a customer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={"all"}>All Customers</SelectItem>
                {customersData?.data.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      }
      className="pb-6"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
        {/* Project List - Left Side */}
        <div className="md:col-span-1 border rounded-lg bg-gray-50 h-full">
          <div className="p-4 border-b">
            <h2 className="text-lg font-medium">專案列表</h2>
            <p className="text-sm text-gray-500">
              {deferredCustomerId !== "all"
                ? `${customersData?.data.find((c) => c.id === deferredCustomerId)?.name} 客戶的專案`
                : "所有的專案"}
            </p>
          </div>
          <ScrollArea className="h-[calc(100vh-240px)]">
            <div
              className={cn(
                "p-4 space-y-2",
                isFetchingProjects && "opacity-50"
              )}
            >
              {deferredCustomerId !== "all" && projectsData?.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  此客戶沒有專案
                </div>
              )}
              {projectsData?.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isSelected={projectId === project.id}
                  onClick={() => handleProjectSelect(project)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Project Details - Right Side */}
        <div className="md:col-span-2 border rounded-lg p-6 bg-white h-full">
          {selectedProject ? (
            <ProjectDetails
              project={selectedProject}
              customerId={deferredCustomerId}
            />
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center">
              <h3 className="text-xl font-medium text-gray-500 mb-4">
                Project Details
              </h3>
              <p className="text-gray-400 max-w-md">
                Select a project from the list to view its details
              </p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}

// Simple Project Card Component
function ProjectCard({
  project,
  isSelected,
  onClick,
}: {
  project: SimpleProject;
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        "p-3 hover:bg-gray-100 transition-colors cursor-pointer flex justify-between items-center",
        isSelected && "bg-gray-200 hover:bg-gray-200 border-blue-500"
      )}
      onClick={onClick}
    >
      <div className="font-medium truncate">{project.name}</div>
    </Card>
  );
}

// Project Details Component
function ProjectDetails({
  project,
  customerId,
}: {
  project: SimpleProject;
  customerId: string;
}) {
  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4 mb-4">
        <h2 className="text-2xl font-bold mb-2">{project.name}</h2>
        <div className="flex items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              project.status === "pending" || project.status === "in_progress"
                ? "bg-green-100 text-green-800 hover:bg-green-100"
                : project.status === "completed"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                  : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            )}
          >
            {project.status}
          </Badge>
          <span className="text-sm text-gray-500">ID: {project.id}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Project Number</h3>
          <p>{project.projectNumber || "Not specified"}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Status</h3>
          <p className="capitalize">{project.status}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Project ID</h3>
          <p>{project.id}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-500">Customer ID</h3>
          <p>{project.customerName}</p>
        </div>
      </div>

      <div className="mt-auto flex justify-end">
        <Button asChild>
          <Link
            className="mr-2"
            to="/production/$customerId/$projectId"
            params={{ projectId: project.id, customerId }}
          >
            進入製成
          </Link>
        </Button>
      </div>
    </div>
  );
}
