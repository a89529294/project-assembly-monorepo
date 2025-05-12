import { CenteredGraySpinner } from "@/components/centered-gray-spinner";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type QueryResultProps<T> = {
  // Data and render function
  data: T;
  children: (data: Exclude<T, undefined>) => ReactNode;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;

  // Optional customization
  error?: Error | unknown;
  errorComponent?: ReactNode;
  loadingComponent?: ReactNode;
  errorClassName?: string;
  loadingClassName?: string;
};

// TODO: clean up with status, right now its too convoluted
export function RenderQueryResult<T>({
  // Core props
  children,
  data,

  // Status flags
  isSuccess,
  isError,
  isLoading,
  isFetching,
  error,

  // Customization
  errorComponent,
  loadingComponent,
  errorClassName,
  loadingClassName,
}: QueryResultProps<T>) {
  // Determine the current state based on provided flags
  const status = {
    loading: isLoading ?? (!isSuccess && !isError),
    error: !!isError,
    success: isSuccess ?? (!isLoading && !isError && data !== undefined),
  };

  // Error state
  if (status.error) {
    return (
      errorComponent ?? (
        <div className={cn("text-red-500 p-4 text-center", errorClassName)}>
          {error instanceof Error ? error.message : "An error occurred"}
        </div>
      )
    );
  }

  // Loading state
  if (status.loading) {
    return (
      loadingComponent ?? (
        <div
          className={cn(
            "absolute inset-0 place-items-center grid",
            loadingClassName
          )}
        >
          <CenteredGraySpinner />
        </div>
      )
    );
  }

  // fetching state
  if (isFetching) {
    return (
      <div className={cn("absoulte inset-0 opacity-50")}>
        {children(data as Exclude<T, undefined>)}
      </div>
    );
  }
  // Success state with data
  if (status.success && data !== undefined) {
    return children(data as Exclude<T, undefined>);
  }

  // Fallback for edge cases
  return <div className="text-gray-500 p-4 text-center">No data available</div>;
}
