import { SelectField } from "@/components/form/select-field";
import { TextField } from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useCounties } from "@/hooks/use-counties";
import { useDistricts } from "@/hooks/use-districts";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  CustomerDetail,
  customerDetailedSchema,
  customerSummarySchema,
} from "@myapp/shared";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";

interface CustomerFormProps {
  initialData?: CustomerDetail;
  onSubmit: (values: CustomerDetail) => void;

  disabled: boolean;
}

export function CustomerForm({
  disabled,
  initialData,
  onSubmit,
}: CustomerFormProps) {
  const {
    data: counties,
    isLoading: isLoadingCounties,
    nameToCode,
    // codeToName,
  } = useCounties();

  const defaultValues: CustomerDetail = {
    customerNumber: "",
    name: "",
    nickname: "",
    category: "",
    principal: "",
    taxDeductionCategory: "",
    taxId: "",
    phone: "",
    fax: "",
    county: "",
    district: "",
    address: "",
    invoiceCounty: "",
    invoiceDistrict: "",
    invoiceAddress: "",
    contacts: [],
  };

  const form = useForm<CustomerDetail>({
    resolver: zodResolver(customerDetailedSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          county: initialData.county
            ? nameToCode[initialData.county]
            : initialData.county,
          invoiceCounty: initialData.invoiceCounty
            ? nameToCode[initialData.invoiceCounty]
            : initialData.invoiceCounty,
        }
      : defaultValues,
    disabled: disabled,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "contacts",
  });

  const { data: districts, isLoading: isLoadingResidenceTown } = useDistricts(
    form.watch("county")
  );
  const { data: invoiceDistricts, isLoading: isLoadingMailingTown } =
    useDistricts(form.watch("invoiceCounty"));

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (e) => {
          console.log(e);
        })}
        className="space-y-8"
        id="customer-form"
      >
        {/* 1. Customer Number Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
          <h3 className="mb-4 text-lg font-medium">客戶編號</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <TextField
              form={form}
              name="customerNumber"
              label="客戶編號"
              required={
                !customerSummarySchema.shape.customerNumber.isNullable()
              }
            />
          </div>
        </div>

        {/* 2. Basic Information Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
          <h3 className="mb-4 text-lg font-medium">基本資料</h3>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <TextField
              form={form}
              name="name"
              label="客戶名稱"
              required={!customerSummarySchema.shape.name.isNullable()}
            />
            <TextField
              form={form}
              name="nickname"
              label="簡稱"
              required={!customerSummarySchema.shape.nickname.isNullable()}
            />
            <TextField
              form={form}
              name="category"
              label="類別"
              required={!customerSummarySchema.shape.category.isNullable()}
            />
            <TextField
              form={form}
              name="principal"
              label="負責人"
              required={!customerSummarySchema.shape.principal.isNullable()}
            />
            <TextField
              form={form}
              name="taxDeductionCategory"
              label="扣稅類別"
              required={
                !customerSummarySchema.shape.taxDeductionCategory.isNullable()
              }
            />
            <TextField
              form={form}
              name="taxId"
              label="統一編號"
              required={!customerSummarySchema.shape.taxId.isNullable()}
            />
            <TextField
              form={form}
              name="phone"
              label="電話"
              required={!customerSummarySchema.shape.phone.isNullable()}
            />
            <TextField
              form={form}
              name="fax"
              label="傳真"
              required={!customerSummarySchema.shape.fax.isNullable()}
            />
          </div>
        </div>

        {/* 3. Addresses Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm mb-6">
          <h3 className="mb-6 text-lg font-medium">地址資料</h3>

          {/* Main Address */}
          <div className="mb-8">
            <h4 className="mb-4 text-md font-medium">主要地址</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-4">
                <SelectField
                  form={form}
                  name="county"
                  label="縣市"
                  required={!customerSummarySchema.shape.county.isNullable()}
                  loading={isLoadingCounties}
                  options={counties}
                  onSelect={() => form.setValue("district", null)}
                />
              </div>
              <div className="md:col-span-4">
                <SelectField
                  form={form}
                  name="district"
                  label="鄉鎮市區"
                  required={!customerSummarySchema.shape.district.isNullable()}
                  loading={isLoadingResidenceTown}
                  options={districts}
                />
              </div>
              <div className="md:col-span-4">
                <TextField
                  form={form}
                  name="address"
                  label="詳細地址"
                  required={!customerSummarySchema.shape.address.isNullable()}
                />
              </div>
            </div>
          </div>

          {/* Invoice Address */}
          <div>
            <h4 className="mb-4 text-md font-medium">發票地址</h4>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-4">
                <SelectField
                  form={form}
                  name="invoiceCounty"
                  label="縣市"
                  required={
                    !customerSummarySchema.shape.invoiceCounty.isNullable()
                  }
                  loading={isLoadingCounties}
                  options={counties}
                  onSelect={() => form.setValue("invoiceDistrict", null)}
                />
              </div>
              <div className="md:col-span-4">
                <SelectField
                  form={form}
                  name="invoiceDistrict"
                  label="鄉鎮市區"
                  required={
                    !customerSummarySchema.shape.invoiceDistrict.isNullable()
                  }
                  loading={isLoadingMailingTown}
                  options={invoiceDistricts}
                />
              </div>
              <div className="md:col-span-4">
                <TextField
                  form={form}
                  name="invoiceAddress"
                  label="詳細地址"
                  required={
                    !customerSummarySchema.shape.invoiceAddress.isNullable()
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Contacts Section */}
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">聯絡人</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                append({
                  name: "",
                  enName: "",
                  phone: "",
                  lineId: "",
                  weChatId: "",
                  memo: "",
                })
              }
            >
              <Plus className="mr-2 h-4 w-4" /> 新增聯絡人
            </Button>
          </div>

          <div className="space-y-4">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="rounded-lg border p-4 pr-16 relative"
              >
                <div className="absolute right-4 top-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:bg-destructive/10"
                    onClick={() => remove(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">刪除聯絡人</span>
                  </Button>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <TextField
                    form={form}
                    name={`contacts.${index}.name`}
                    label="姓名"
                    required
                  />
                  <TextField
                    form={form}
                    name={`contacts.${index}.enName`}
                    label="英文姓名"
                  />
                  <TextField
                    form={form}
                    name={`contacts.${index}.phone`}
                    label="電話"
                    required
                  />
                  <TextField
                    form={form}
                    name={`contacts.${index}.lineId`}
                    label="Line ID"
                  />
                  <TextField
                    form={form}
                    name={`contacts.${index}.weChatId`}
                    label="微信 ID"
                  />
                  <TextField
                    form={form}
                    name={`contacts.${index}.memo`}
                    label="備註"
                  />
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="rounded-lg border-2 border-dashed p-8 text-center">
                <p className="text-muted-foreground">尚未新增聯絡人</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
