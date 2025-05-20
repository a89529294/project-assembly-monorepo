import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { SelectField } from "./form/select-field";
import { TextField } from "./form/text-field";
import { useDistricts } from "../hooks/use-districts";

type AddressFields = {
  county: string | null;
  district: string | null;
  address: string | null;
};

type WithPrefix<T, TPrefix extends string> = {
  [K in keyof T as K extends string ? `${TPrefix}${Capitalize<K>}` : never]: T[K];
};

type AddressFieldsWithPrefix<TPrefix extends string> = WithPrefix<AddressFields, TPrefix>;

type FormFields<T extends FieldValues, TPrefix extends string> = T & AddressFieldsWithPrefix<TPrefix>;

interface AddressFieldsProps<T extends FieldValues, TPrefix extends string> {
  form: UseFormReturn<FormFields<T, TPrefix>>;
  prefix?: TPrefix;
  title: string;
  countyRequired?: boolean;
  districtRequired?: boolean;
  addressRequired?: boolean;
  loadingCounties?: boolean;
  counties: { value: string; label: string }[];
  className?: string;
}

export function AddressFields<T extends FieldValues, TPrefix extends string = "">({
  form,
  prefix = "" as TPrefix,
  title,
  countyRequired = true,
  districtRequired = true,
  addressRequired = true,
  loadingCounties = false,
  counties = [],
  className = "",
}: AddressFieldsProps<T, TPrefix>) {
  const countyField = (prefix ? `${prefix}County` : "county") as Path<FormFields<T, TPrefix>>;
  const districtField = (prefix ? `${prefix}District` : "district") as Path<FormFields<T, TPrefix>>;
  const addressField = (prefix ? `${prefix}Address` : "address") as Path<FormFields<T, TPrefix>>;

  const countyValue = form.watch(countyField) as string | null;
  const { data: districts = [], isLoading: isLoadingDistricts } = useDistricts(
    countyValue
  );

  const handleCountyChange = () => {
    form.setValue(districtField, null);
  };

  return (
    <div className={className}>
      <h4 className="mb-4 text-md font-medium">{title}</h4>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="md:col-span-4">
          <SelectField
            form={form}
            name={countyField}
            label="縣市"
            required={countyRequired}
            loading={loadingCounties}
            options={counties}
            onSelect={handleCountyChange}
          />
        </div>
        <div className="md:col-span-4">
          <SelectField
            form={form}
            name={districtField}
            label="鄉鎮市區"
            required={districtRequired}
            loading={isLoadingDistricts}
            options={districts}
          />
        </div>
        <div className="md:col-span-4">
          <TextField
            form={form}
            name={addressField}
            label="詳細地址"
            required={addressRequired}
          />
        </div>
      </div>
    </div>
  );
}
