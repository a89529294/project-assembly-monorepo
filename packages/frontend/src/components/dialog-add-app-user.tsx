import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useQuery } from "@tanstack/react-query";
import { trpc } from "@/trpc";
import { Button } from "@/components/ui/button";
import { TrpcTypes } from "../../../backend/src/trpc/router";

export const DialogAddAppUser = () => {
  const { data } = useQuery(
    trpc.personnelPermission.getAppUserByPermission.queryOptions()
  );

  console.log("from dialog ", data);

  // State for selected user
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(
    null
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Edit Profile</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add App User</DialogTitle>
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
            <div className="min-w-[300px]">
              {data.map((user: TrpcTypes["AppUser"]) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUserId(user.id)}
                  className={`px-4 py-2 cursor-pointer border-b border-[#f1f1f1] ${selectedUserId === user.id ? "bg-indigo-100 font-semibold" : "font-normal"}`}
                  tabIndex={0}
                  role="button"
                  aria-selected={selectedUserId === user.id}
                >
                  {/* Display user info here. Adjust as needed. */}
                  {user.employee.chName || user.employee.email}
                </div>
              ))}
            </div>
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
