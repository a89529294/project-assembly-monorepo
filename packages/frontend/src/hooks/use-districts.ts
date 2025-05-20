import { useQuery } from "@tanstack/react-query";

export function useDistricts(countycode: string | null) {
  return useQuery({
    queryKey: ["towns", countycode],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 5000));
      const response = await fetch(
        `https://api.nlsc.gov.tw/other/ListTown1/${countycode}`
      );

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(await response.text(), "text/xml");
      const countiesElements = Array.from(
        xmlDoc.getElementsByTagName("townItem")
      );
      const counties = countiesElements.map((c) => ({
        value: c.getElementsByTagName("townname")[0].childNodes[0].nodeValue!,
        label: c.getElementsByTagName("townname")[0].childNodes[0].nodeValue!,
      }));
      return counties;
    },
    enabled: !!countycode,
  });
}
