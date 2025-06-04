import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyInfo } from "@/hooks/use-company-info";
import { cn } from "@/lib/utils";
import { queryClient } from "@/query-client";
import { trpc } from "@/trpc";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companyInfoFormSchema } from "@myapp/shared";
import { TextField } from "@/components/form/text-field";
import { Form, FormLabel } from "@/components/ui/form";
import { useCounties } from "@/hooks/use-counties";
import { useDistricts } from "@/hooks/use-districts";
import { SelectField } from "@/components/form/select-field";

// TODO clean up the logic
export const Route = createFileRoute("/_dashboard/basic-info/company-info")({
  validateSearch: z.object({
    mode: z.enum(["read", "edit"]).default("read"),
  }),
  async loader() {
    await queryClient.ensureQueryData(
      trpc.basicInfo.readCompanyInfo.queryOptions()
    );
  },
  component: CompanyInfoPage,
  pendingComponent: () => <Skeleton className="inset-7 left-4.5 absolute" />,
});

function CompanyInfoPage() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mode } = Route.useSearch();
  const navigate = useNavigate();

  const {
    data: formState,
    createCompanyInfo,
    updateCompanyInfo,
    uploadCompanyLogo,
    deleteCompanyInfoLogo,
  } = useCompanyInfo();
  console.log(formState);
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState(formState?.logoURL);
  const {
    counties,
    isLoading: isLoadingCounties,
    nameToCode,
    codeToName,
  } = useCounties();
  const isPendingMutate =
    createCompanyInfo.isPending ||
    updateCompanyInfo.isPending ||
    uploadCompanyLogo.isPending;

  const form = useForm({
    resolver: zodResolver(companyInfoFormSchema),
    defaultValues: formState
      ? {
          ...formState,
          county: nameToCode[formState.county],
        }
      : {
          name: "",
          phone: "",
          email: "",
          fax: "",
          taxId: "",
          county: "",
          district: "",
          address: "",
          logoURL: null,
        },
    disabled: isPendingMutate || mode === "read",
  });

  const { data: districts, isFetching: isFetchingDistricts } = useDistricts(
    form.watch("county")
  );

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

  const isReadMode = mode === "read";
  const disableInputs = isReadMode || isPendingMutate;

  const onSubmit: SubmitHandler<z.infer<typeof companyInfoFormSchema>> = async (
    data
  ) => {
    const isNewCompany = !formState;

    const mutateCompanyInfo = (logoURL?: string) => {
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

      const payload = {
        ...data,
        county: codeToName[data.county],
        logoURL,
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
      setLogo(null);
    } else {
      if (data.logoURL && logo === null) {
        await deleteCompanyInfoLogo.mutateAsync();
      }
      mutateCompanyInfo();
    }
  };

  return (
    <div className="p-7 pl-4.5 bg-surface-100 h-full">
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
            <div className="space-y-8">
              <TextField
                form={form}
                name="name"
                label="公司名稱"
                required
                hideAsterisk={mode === "read"}
                containerClassName="flex gap-0"
                labelClassName="w-20 text-secondary-600"
                inputClassName={cn(
                  "h-10 border border-surface-100 rounded-sm w-full disabled:text-secondary-900 disabled:opacity-100",
                  mode === "read" && "border-none shadow-none"
                )}
                placeholder="請輸入公司名稱"
              />

              <TextField
                form={form}
                name="phone"
                label="聯絡電話"
                required
                containerClassName="flex gap-0"
                labelClassName="w-20 text-secondary-600"
                hideAsterisk={mode === "read"}
                inputClassName={cn(
                  "h-10 border border-surface-100 rounded-sm w-full disabled:text-secondary-900 disabled:opacity-100",
                  mode === "read" && "border-none shadow-none"
                )}
                placeholder="請輸入聯絡電話"
              />

              <TextField
                form={form}
                name="email"
                label="Email"
                required
                containerClassName="flex gap-0"
                labelClassName="w-20 text-secondary-600"
                hideAsterisk={mode === "read"}
                inputClassName={cn(
                  "h-10 border border-surface-100 rounded-sm w-full disabled:text-secondary-900 disabled:opacity-100",
                  mode === "read" && "border-none shadow-none"
                )}
                placeholder="請輸入Email"
              />
              <TextField
                form={form}
                name="fax"
                label="傳真"
                required
                containerClassName="flex gap-0"
                labelClassName="w-20 text-secondary-600"
                hideAsterisk={mode === "read"}
                inputClassName={cn(
                  "h-10 border border-surface-100 rounded-sm w-full disabled:text-secondary-900 disabled:opacity-100",
                  mode === "read" && "border-none shadow-none"
                )}
                placeholder="請輸入傳真號碼"
              />

              <TextField
                form={form}
                name="taxId"
                label="統一編號"
                required
                containerClassName="flex gap-0"
                labelClassName="w-20 text-secondary-600"
                hideAsterisk={mode === "read"}
                inputClassName={cn(
                  "h-10 border border-surface-100 rounded-sm w-full disabled:text-secondary-900 disabled:opacity-100",
                  mode === "read" && "border-none shadow-none"
                )}
                placeholder="請輸入統一編號"
              />

              <div className="flex shrink-0">
                <FormLabel
                  className={cn("gap-0 text-title-mn w-20 text-secondary-600")}
                >
                  公司地址
                  {mode === "edit" && <span className="text-red-400">*</span>}
                </FormLabel>
                <div className="flex-1 flex gap-2">
                  {mode === "read" && (
                    <p className="h-10 text-body-lg pl-3 flex items-center text-secondary-900">
                      {form.getValues("county")}
                      {form.getValues("district")}
                      {form.getValues("address")}
                    </p>
                  )}
                  {mode === "edit" && (
                    <>
                      <SelectField
                        form={form}
                        name="county"
                        loading={isLoadingCounties}
                        options={counties}
                        hideLabel
                        containerClassName="flex-1"
                        triggerClassName="h-10"
                        placeholder="請選擇縣/市"
                      />
                      <SelectField
                        form={form}
                        name="district"
                        loading={isFetchingDistricts}
                        options={districts}
                        hideLabel
                        containerClassName="flex-1"
                        triggerClassName="h-10"
                        placeholder="請選擇區"
                      />
                      <TextField
                        form={form}
                        name="address"
                        hideLabel
                        containerClassName="flex flex-1"
                        inputClassName="h-10 border border-surface-100 rounded-sm flex-1"
                        placeholder="請輸入地址"
                      />
                    </>
                  )}
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

              {logoPreview ? (
                <button
                  type="button"
                  className={cn(
                    "absolute right-3 bottom-3 p-2 border border-secondary-900 rounded-sm",
                    disableInputs && "hidden"
                  )}
                  onClick={() => {
                    setLogo(null);
                    setLogoPreview(null);
                  }}
                  disabled={disableInputs}
                >
                  <img src="/delete.png" className="size-6" />
                </button>
              ) : (
                <button
                  type="button"
                  className={cn(
                    "absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 bg-primary-300 rounded-sm text-button-sm flex gap-1 py-2 px-4 cursor-pointer",
                    disableInputs && "hidden"
                  )}
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  disabled={disableInputs}
                >
                  <img src="/upload.png" className="size-4" />
                  上傳 logo
                </button>
              )}
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
