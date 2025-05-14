import { CenteredGraySpinner } from "@/components/centered-gray-spinner";
import { cn } from "@/lib/utils";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { TRPCClientErrorLike } from "@trpc/client";
import { ReactNode } from "react";
import { AppRouter } from "../../../backend/src/trpc/router";

type CommonProps<T> = {
  children: (data: Exclude<T, undefined>) => ReactNode;
  errorComponent?: ReactNode;
  loadingComponent?: ReactNode;
  errorClassName?: string;
  loadingClassName?: string;
};

// Define props for query and mutation separately
type QueryProps<T> = {
  useQueryResult: UseQueryResult<T, TRPCClientErrorLike<AppRouter>>;
  useMutationResult?: never; // Ensure mutation is not provided
} & CommonProps<T>;

type MutationProps<T, V> = {
  useMutationResult: UseMutationResult<T, TRPCClientErrorLike<AppRouter>, V>;
  useQueryResult?: never; // Ensure query is not provided
} & CommonProps<T>;

// Union type to ensure exactly one of useQueryResult or useMutationResult
type RenderResultProps<T, V> = QueryProps<T> | MutationProps<T, V>;

export function RenderResult<T, V>({
  useQueryResult,
  useMutationResult,
  children,
  loadingComponent,
  loadingClassName,
  errorComponent,
  errorClassName,
}: RenderResultProps<T, V>) {
  // Determine which result type we're handling and destructure accordingly
  let data: T | undefined;
  let isError = false;
  let isLoading = false;
  let isFetching = false;
  let isPending = false;
  let isSuccess = false;
  let error: unknown = undefined;
  const isQuery = !!useQueryResult;

  if (isQuery) {
    data = useQueryResult.data;
    isError = useQueryResult.isError;
    isLoading = useQueryResult.isLoading;
    isFetching = useQueryResult.isFetching;
    isSuccess = useQueryResult.isSuccess;
    error = useQueryResult.error;
  } else if (useMutationResult) {
    data = useMutationResult.data;
    isError = useMutationResult.isError;
    isPending = useMutationResult.isPending;
    isSuccess = useMutationResult.isSuccess;
    error = useMutationResult.error;
  }

  const renderError = () =>
    errorComponent ?? (
      <div className={cn("text-red-500 p-4 text-center", errorClassName)}>
        {error instanceof Error ? error.message : "An error occurred"}
      </div>
    );

  const renderLoading = () =>
    loadingComponent ?? (
      <div
        className={cn(
          "absolute inset-0 place-items-center grid",
          loadingClassName
        )}
      >
        <CenteredGraySpinner />
      </div>
    );

  if (isError) return renderError();
  if (isLoading || isPending) return renderLoading();

  // Query-specific fetching overlay
  if (isQuery && isFetching) {
    return (
      <div className={cn("absolute inset-0 opacity-50 overflow-hidden")}>
        {children(data as Exclude<T, undefined>)}
      </div>
    );
  }

  if (isSuccess) {
    return children(data as Exclude<T, undefined>);
  }

  return null;
}
