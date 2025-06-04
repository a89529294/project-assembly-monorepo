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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyInfoFormSchema } from "@myapp/shared";
import { TextField } from "@/components/form/text-field";
import { Form, FormLabel } from "@/components/ui/form";
import { useCounties } from "@/hooks/use-counties";
import { useDistricts } from "@/hooks/use-districts";
import { SelectField } from "@/components/form/select-field";

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
      throw e;
    }
  },
  component: CompanyInfoPage,
  pendingComponent: () => <Skeleton className="mt-12 mx-6 h-full" />,
});

function CompanyInfoPage() {
  const form = useForm({
    resolver: zodResolver(companyInfoFormSchema),
  });
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
  const {
    counties,
    isLoading: isLoadingCounties,
    nameToCode,
    codeToName,
  } = useCounties();
  const { data: districts, isFetching: isFetchingDistricts } = useDistricts(
    form.watch("county")
  );

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
    navigate({
      from: "/basic-info/company-info",
      search: { mode: "edit" },
    });
  };
  const handleCancelClick = () => {
    navigate({
      from: "/basic-info/company-info",
      search: { mode: "read" },
    });
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
          queryClient.invalidateQueries({
            queryKey: trpc.basicInfo.readCompanyInfo.queryOptions().queryKey,
          });
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

  const onSubmit = (data) => console.log(data);

  return (
    <div className="p-7 pl-4.5 bg-surface-100 h-full">
      {/* <form className="" onSubmit={handleSaveClick}> */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Toolbar */}
          <div className="flex justify-end mb-6 gap-2">
            {isReadMode ? (
              <button
                key="company-info-edit-button"
                type="button"
                className="h-9 px-3 text-button-sm flex items-center gap-1 border-secondary-700 border rounded-sm"
                onClick={handleEditClick}
              >
                <img src="/pencil.png" className="size-4" />
                編輯
              </button>
            ) : (
              <>
                <button
                  key="company-info-cancel-btn"
                  type="button"
                  className={cn(
                    "h-9 px-3 text-button-sm flex items-center gap-1 bg-danger-200 rounded-sm text-surface-0",
                    disableInputs && "opacity-80 cursor-not-allowed"
                  )}
                  onClick={handleCancelClick}
                  disabled={disableInputs}
                >
                  <img src="/x.png" className="size-4" />
                  取消
                </button>
                <button
                  key="company-info-submit-btn"
                  type="submit"
                  className={cn(
                    "h-9 px-3 text-button-sm flex items-center gap-1 bg-primary-300 rounded-sm text-black",
                    disableInputs && "opacity-80 cursor-not-allowed"
                  )}
                  disabled={disableInputs}
                >
                  <img src="/save.png" className="size-4" />
                  儲存
                </button>
              </>
            )}
          </div>

          <div className="grid grid-cols-[1fr_auto] bg-white gap-4 py-3.5 pl-8 pr-4">
            {/* left 5 inputs */}
            <div className="space-y-8">
              <TextField
                form={form}
                name="name"
                label="公司名稱"
                required
                containerClassName="flex "
                labelClassName="w-20"
                inputClassName="h-10 border border-surface-100 rounded-sm w-full "
                placeholder="請輸入公司名稱"
              />

              <TextField
                form={form}
                name="phone"
                label="聯絡電話"
                required
                containerClassName="flex "
                labelClassName="w-20"
                inputClassName="h-10 border border-surface-100 rounded-sm w-full "
                placeholder="請輸入聯絡電話"
              />

              <TextField
                form={form}
                name="email"
                label="Email"
                required
                containerClassName="flex "
                labelClassName="w-20"
                inputClassName="h-10 border border-surface-100 rounded-sm w-full "
                placeholder="請輸入Email"
              />
              <TextField
                form={form}
                name="fax"
                label="傳真"
                required
                containerClassName="flex "
                labelClassName="w-20"
                inputClassName="h-10 border border-surface-100 rounded-sm w-full "
                placeholder="請輸入傳真號碼"
              />

              <TextField
                form={form}
                name="fax"
                label="傳真"
                required
                containerClassName="flex "
                labelClassName="w-20"
                inputClassName="h-10 border border-surface-100 rounded-sm w-full "
                placeholder="請輸入傳真號碼"
              />
              <TextField
                form={form}
                name="taxId"
                label="統一編號"
                required
                containerClassName="flex "
                labelClassName="w-20"
                inputClassName="h-10 border border-surface-100 rounded-sm w-full "
                placeholder="請輸入統一編號"
              />

              <div className="flex">
                <FormLabel className={cn("gap-0 text-title-mn w-20")}>
                  公司地址
                  <span className="text-red-400">*</span>
                </FormLabel>
                <div className="flex-1 flex gap-2">
                  <SelectField
                    form={form}
                    name="district"
                    loading={isLoadingCounties}
                    options={counties}
                    hideLabel
                    containerClassName="flex-1"
                    placeholder="請選擇縣/市"
                  />
                  <SelectField
                    form={form}
                    name="district"
                    loading={isFetchingDistricts}
                    options={districts}
                    hideLabel
                    containerClassName="flex-1"
                    placeholder="請選擇區"
                  />
                  <TextField
                    form={form}
                    name="address"
                    hideLabel
                    containerClassName="flex flex-1"
                    inputClassName="h-10 border border-surface-100 rounded-sm flex-1"
                    placeholder="請輸入統一編號"
                  />
                </div>
              </div>
            </div>

            {/* logo input */}
            <div className="aspect-[384/432] flex flex-col items-center justify-center relative border">
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
          </div>
        </form>
      </Form>
    </div>
  );
}
