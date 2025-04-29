// use-company-info.ts
import { useQuery, useMutation } from "@tanstack/react-query";
import { trpc } from "@/trpc";

export function useCompanyInfo(isNewCompany: boolean) {
  const companyQuery = useQuery({
    ...trpc.basicInfo.readCompanyInfo.queryOptions(),
    enabled: !isNewCompany,
  });

  const createCompanyInfo = useMutation(
    trpc.basicInfo.createCompanyInfo.mutationOptions()
  );
  const updateCompanyInfo = useMutation(
    trpc.basicInfo.updateCompanyInfo.mutationOptions()
  );
  const uploadCompanyLogo = useMutation(
    trpc.basicInfo.uploadCompanyLogo.mutationOptions()
  );

  return {
    ...companyQuery,
    createCompanyInfo,
    updateCompanyInfo,
    uploadCompanyLogo,
  };
}
