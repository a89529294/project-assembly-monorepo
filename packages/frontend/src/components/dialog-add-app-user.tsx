import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

interface DialogAddAppUserProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DialogAddAppUser: React.FC<DialogAddAppUserProps> = ({ open, onOpenChange }) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add App User</DialogTitle>
          <DialogDescription>
            Fill in the details to add a new app user. (Placeholder for form)
          </DialogDescription>
        </DialogHeader>
        {/* TODO: Add form fields here */}
        <DialogFooter>
          {/* Add actions like Save/Cancel here */}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
