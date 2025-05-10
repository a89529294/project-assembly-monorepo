// import { queryClient } from "@/query-client";
// import { UseMutationOptions, useMutation } from "@tanstack/react-query";
// import { toast } from "sonner";

// type MutationOptions<TData, TError, TVariables, TContext> = Omit<
//   UseMutationOptions<TData, TError, TVariables, TContext>,
//   "mutationFn"
// >;

// interface MutationWithToastOptions<TData, TError, TVariables, TContext> {
//   mutationFn: (variables: TVariables) => Promise<TData>;
//   successMessage?: string | ((data: TData, variables: TVariables) => string);
//   errorMessage?: string | ((error: TError, variables: TVariables) => string);
//   invalidateQueries?:
//     | string[][]
//     | ((variables: TVariables, data: TData) => string[][]);
//   onSuccessCallback?: (
//     data: TData,
//     variables: TVariables,
//     context: TContext | undefined
//   ) => void;
//   onErrorCallback?: (
//     error: TError,
//     variables: TVariables,
//     context: TContext | undefined
//   ) => void;
//   options?: Partial<MutationOptions<TData, TError, TVariables, TContext>>;
// }

// /**
//  * A custom hook for handling mutations with toast notifications and query invalidation
//  */
// export function useMutationWithToast<
//   TData = unknown,
//   TError = Error,
//   TVariables = void,
//   TContext = unknown,
// >({
//   mutationFn,
//   successMessage = "操作成功",
//   errorMessage = "操作失敗",
//   invalidateQueries,
//   onSuccessCallback,
//   onErrorCallback,
//   options = {},
// }: MutationWithToastOptions<TData, TError, TVariables, TContext>) {
//   return useMutation<TData, TError, TVariables, TContext>({
//     mutationFn,
//     ...(options as any),
//     onSuccess: (data, variables, context) => {
//       // Show success toast
//       if (successMessage) {
//         const message =
//           typeof successMessage === "function"
//             ? successMessage(data, variables)
//             : successMessage;
//         toast.success(message);
//       }

//       // Invalidate queries
//       if (invalidateQueries) {
//         const queriesToInvalidate =
//           typeof invalidateQueries === "function"
//             ? invalidateQueries(variables, data)
//             : invalidateQueries;

//         queriesToInvalidate.forEach((queryKey) => {
//           queryClient.invalidateQueries({ queryKey });
//         });
//       }

//       // Call custom success callback
//       if (onSuccessCallback) {
//         onSuccessCallback(data, variables, context);
//       }

//       // Call original onSuccess if provided in options
//       const originalOnSuccess = (options as any).onSuccess;
//       if (originalOnSuccess && typeof originalOnSuccess === "function") {
//         originalOnSuccess(data, variables, context);
//       }
//     },
//     onError: (error, variables, context) => {
//       // Show error toast
//       if (errorMessage) {
//         const message =
//           typeof errorMessage === "function"
//             ? errorMessage(error, variables)
//             : errorMessage;
//         toast.error(message);
//       }

//       // Call custom error callback
//       if (onErrorCallback) {
//         onErrorCallback(error, variables, context);
//       }

//       // Call original onError if provided in options
//       const originalOnError = (options as any).onError;
//       if (originalOnError && typeof originalOnError === "function") {
//         originalOnError(error, variables, context);
//       }
//     },
//   });
// }
