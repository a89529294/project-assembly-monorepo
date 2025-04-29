import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyInfo } from "@/hooks/use-company-info";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { TRPCClientError } from "@trpc/client";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

export const Route = createFileRoute("/_dashboard/basic-info/company-info")({
  validateSearch: z.object({
    mode: z.enum(["read", "edit"]).optional().catch("read"),
  }),
  async loader() {
    try {
      await queryClient.ensureQueryData(
        trpc.basicInfo.readCompanyInfo.queryOptions()
      );
      return false;
    } catch (e: unknown) {
      if (e instanceof TRPCClientError && e.data?.httpStatus === 404)
        return true;
      throw new Error("unknown");
    }
  },
  component: CompanyInfoPage,
  pendingComponent: () => <Skeleton className="mt-12 mx-6 h-full" />,
  errorComponent: () => "error",
});

function CompanyInfoPage() {
  const isNewCompany = Route.useLoaderData();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const search = Route.useSearch();
  const navigate = useNavigate();
  const mode = search.mode ?? "read";
  const {
    data: formState,
    createCompanyInfo,
    updateCompanyInfo,
    uploadCompanyLogo,
  } = useCompanyInfo(isNewCompany);

  const [logoPreview, setLogoPreview] = useState<string | undefined>(
    formState?.logoURL ?? undefined
  );
  const [logo, setLogo] = useState<File | null>(null);
  const isPendingMutate =
    createCompanyInfo.isPending ||
    updateCompanyInfo.isPending ||
    uploadCompanyLogo.isPending;

  const handleLogoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogo(e.target.files[0]);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleEditClick = () => {
    navigate({ from: "/basic-info/company-info", search: { mode: "edit" } });
  };
  const handleCancelClick = () => {
    navigate({ from: "/basic-info/company-info", search: { mode: "read" } });
  };
  const handleSaveClick = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formEle = e.currentTarget;
    const formData = new FormData(formEle);

    const mutateCompanyInfo = (logoURL?: string) => {
      const payload: Parameters<(typeof createCompanyInfo)["mutate"]>[0] = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        fax: formData.get("fax") as string,
        taxId: formData.get("taxId") as string,
        county: formData.get("county") as string,
        district: formData.get("district") as string,
        address: formData.get("address") as string,
        logoURL,
      };

      const config = {
        onSuccess: () => {
          navigate({
            from: "/basic-info/company-info",
            search: { mode: "read" },
          });

          toast.success(isNewCompany ? "成功新增公司資訊" : "成功更新公司資訊");
        },
        onError: () =>
          toast.error(isNewCompany ? "無法新增公司資訊" : "無法更新公司資訊"),
      };

      if (isNewCompany) {
        createCompanyInfo.mutate(payload, config);
      } else updateCompanyInfo.mutate(payload, config);
    };
    if (logo) {
      uploadCompanyLogo.mutate(logo, {
        onSuccess: (c) => {
          mutateCompanyInfo(c);
        },
        onError: () => {
          toast.error("上傳logo失敗");
          setLogoPreview(undefined);
        },
      });
      // prevent uploading the same logo
      setLogo(null);
    } else {
      mutateCompanyInfo();
    }
  };

  const isReadMode = mode === "read";
  const disableInputs = isReadMode || isPendingMutate;

  return (
    <div className="pt-12 px-6">
      <form
        className="bg-white shadow rounded-lg p-6"
        onSubmit={handleSaveClick}
      >
        {/* Toolbar */}
        <div className="flex justify-end mb-6 gap-2">
          {isReadMode ? (
            <button
              key="edit-button"
              type="button"
              className="px-4 py-1 rounded bg-blue-500 text-white hover:bg-blue-600 transition"
              onClick={handleEditClick}
              data-testid="edit-btn"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                key="cancel-btn"
                type="button"
                className={cn(
                  "px-4 py-1 rounded bg-gray-200 text-gray-700  transition",
                  disableInputs
                    ? "opacity-80 cursor-not-allowed"
                    : "hover:bg-gray-300"
                )}
                onClick={handleCancelClick}
                data-testid="cancel-btn"
                disabled={disableInputs}
              >
                Cancel
              </button>
              <button
                key="submit-btn"
                type="submit"
                className={cn(
                  "px-4 py-1 rounded bg-blue-500 text-white transition",
                  disableInputs
                    ? "opacity-80 cursor-not-allowed"
                    : "hover:bg-blue-600"
                )}
                data-testid="save-btn"
                disabled={disableInputs}
              >
                Save
              </button>
            </>
          )}
        </div>
        <div className="grid grid-cols-[1fr_auto]  gap-4">
          {/* left 5 inputs */}
          <div>
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name*
              </label>
              <input
                id="name"
                name="name"
                required
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.name}
              />
            </div>
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-medium text-gray-700"
              >
                Phone*
              </label>
              <input
                id="phone"
                name="phone"
                required
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.phone}
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email*
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.email}
              />
            </div>
            <div>
              <label
                htmlFor="fax"
                className="block text-sm font-medium text-gray-700"
              >
                Fax*
              </label>
              <input
                id="fax"
                name="fax"
                required
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.fax}
              />
            </div>
            <div>
              <label
                htmlFor="taxId"
                className="block text-sm font-medium text-gray-700"
              >
                Tax ID*
              </label>
              <input
                id="taxId"
                name="taxId"
                required
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.taxId}
              />
            </div>
          </div>

          {/* logo input */}
          <div className="aspect-square flex flex-col items-center justify-center relative border">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoChange}
              disabled={disableInputs}
            />

            {logoPreview && (
              <div className="absolute inset-0 flex justify-center items-center">
                <img
                  src={logoPreview}
                  alt="Logo Preview"
                  className="h-full object-contain"
                />
              </div>
            )}

            <button
              type="button"
              className={cn(
                "absolute right-3 bottom-3 px-4 py-1 rounded bg-blue-100 text-blue-700 transition",
                disableInputs
                  ? "opacity-80 cursor-not-allowed"
                  : "hover:bg-blue-200"
              )}
              onClick={() => !disableInputs && fileInputRef.current?.click()}
              disabled={disableInputs}
            >
              上傳 Logo
            </button>
          </div>

          {/* address inputs */}
          <div className="flex gap-2">
            <div className="w-1/3">
              <label
                htmlFor="county"
                className="block text-sm font-medium text-gray-700"
              >
                County
              </label>
              <input
                id="county"
                name="county"
                placeholder="County"
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.county}
              />
            </div>
            <div className="w-1/3">
              <label
                htmlFor="district"
                className="block text-sm font-medium text-gray-700"
              >
                District
              </label>
              <input
                id="district"
                name="district"
                placeholder="District"
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.district}
              />
            </div>
            <div className="w-1/3">
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                placeholder="Address"
                className={`mt-1 block w-full border rounded-md shadow-sm p-2 border-gray-300 text-gray-900 ${disableInputs ? "bg-gray-100 border-gray-200 cursor-not-allowed opacity-80" : "bg-white"} `}
                disabled={disableInputs}
                defaultValue={formState?.address}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
