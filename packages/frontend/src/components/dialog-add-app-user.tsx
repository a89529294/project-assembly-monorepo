import { DataTable } from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { appUsersColumns } from "@/features/app-users/data-table/columns";
import { trpc } from "@/trpc";
import { useQuery } from "@tanstack/react-query";

export const DialogAddAppUser = () => {
  const { data } = useQuery(
    trpc.personnelPermission.getAppUserByPermission.queryOptions()
  );

  // State for selected user
  // const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
  //   null
  // );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">新增員工</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新增員工</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new app user. (Placeholder for form)
          </DialogDescription>
        </DialogHeader>
        {/* App Users List */}
        <div
          className="max-h-[400px] mt-4 rounded border border-gray-200"
          style={{
            overflowY: data && data.length > 10 ? "auto" : "visible",
          }}
        >
          {data && data.length > 0 ? (
            <DataTable columns={appUsersColumns} data={data} />
          ) : (
            <div className="text-gray-500 p-4">No users found.</div>
          )}
        </div>
        {/* TODO: Add form fields here */}
        <DialogFooter>{/* Add actions like Save/Cancel here */}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
