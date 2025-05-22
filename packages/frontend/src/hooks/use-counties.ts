import { useQuery } from "@tanstack/react-query";

const nameToCode: Record<string, string> = {
  臺北市: "A",
  臺中市: "B",
  基隆市: "C",
  臺南市: "D",
  高雄市: "E",
  新北市: "F",
  宜蘭縣: "G",
  桃園市: "H",
  嘉義市: "I",
  新竹縣: "J",
  苗栗縣: "K",
  南投縣: "M",
  彰化縣: "N",
  新竹市: "O",
  雲林縣: "P",
  嘉義縣: "Q",
  屏東縣: "T",
  花蓮縣: "U",
  臺東縣: "V",
  金門縣: "W",
  澎湖縣: "X",
  連江縣: "Z",
};

export function useCounties() {
  const { data, ...rest } = useQuery({
    queryKey: ["counties"],
    queryFn: async () => {
      const response = await fetch("https://api.nlsc.gov.tw/other/ListCounty");

      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(await response.text(), "text/xml");
      const countiesElements = Array.from(
        xmlDoc.getElementsByTagName("countyItem")
      );
      return countiesElements.map((c) => ({
        value: c.getElementsByTagName("countycode")[0].childNodes[0].nodeValue!,
        label: c.getElementsByTagName("countyname")[0].childNodes[0].nodeValue!,
      }));
    },
  });

  return {
    counties: data,
    ...rest,
    nameToCode,
    codeToName: Object.fromEntries(
      Object.entries(nameToCode).map(([k, v]) => [v, k])
    ),
  };
}
