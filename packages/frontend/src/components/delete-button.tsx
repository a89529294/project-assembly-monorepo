import { ReactNode } from "@tanstack/react-router";
import { Button } from "./ui/button";
import { SelectionStateData } from "@/hooks/use-selection";

type DeleteButtonProps<T> = {
  // The delete hook that follows the pattern of useDeleteUsers
  useDeleteHook: (props: T) => {
    onDelete: () => void;
    isPending: boolean;
  };
  // Props that will be passed to the delete hook
  hookProps: T;
  // Button text
  children?: ReactNode;
  // Additional button props
  buttonProps?: React.ComponentProps<typeof Button>;
};

export function DeleteButton<T extends { selectionData: SelectionStateData }>({
  useDeleteHook,
  hookProps,
  children = "Delete",
  buttonProps = {},
}: DeleteButtonProps<T>) {
  const { onDelete, isPending } = useDeleteHook(hookProps);

  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={onDelete}
      disabled={isPending}
      {...buttonProps}
    >
      {children}
    </Button>
  );
}
