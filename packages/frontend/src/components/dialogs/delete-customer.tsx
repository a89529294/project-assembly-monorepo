import { DialogDeleteBase } from "@/components/dialogs/delete-base";
import { useDeleteCustomers } from "@/hooks/customers/use-delete-customers";
import { CustomerSummary } from "@myapp/shared";
import { useState } from "react";

type Props = {
  customer: CustomerSummary;
};

export function DialogDeleteCustomer({ customer }: Props) {
  const [open, setOpen] = useState(false);

  const { onDelete, isPending } = useDeleteCustomers({
    selectionData: {
      selectedIds: [customer.id],
      selectAll: false,
    },
    onSuccess() {
      setOpen(false);
    },
  });

  return (
    <DialogDeleteBase
      entityType="客戶"
      entityName={customer.name}
      isPending={isPending}
      onDelete={onDelete}
      open={open}
      setOpen={setOpen}
    />
  );
}
