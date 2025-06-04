// use-company-info.ts
import { privateFetch } from "@/lib/utils";
import { trpc } from "@/trpc";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";

export function useCompanyInfo() {
  const companyQuery = useSuspenseQuery(
    trpc.basicInfo.readCompanyInfo.queryOptions()
  );

  const createCompanyInfo = useMutation(
    trpc.basicInfo.createCompanyInfo.mutationOptions()
  );
  const updateCompanyInfo = useMutation(
    trpc.basicInfo.updateCompanyInfo.mutationOptions()
  );
  const deleteCompanyInfoLogo = useMutation(
    trpc.basicInfo.deleteCompanyInfoLogo.mutationOptions()
  );

  async function uploadCompanyLogoFn(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const response = await privateFetch("/file/upload-company-logo", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    return data.logoURL;
  }

  const uploadCompanyLogo = useMutation({
    mutationFn: uploadCompanyLogoFn,
  });

  return {
    ...companyQuery,
    createCompanyInfo,
    updateCompanyInfo,
    uploadCompanyLogo,
    deleteCompanyInfoLogo,
  };
}
