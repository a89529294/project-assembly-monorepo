import React, { useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/basic-info/company-info")({
  component: CompanyInfoPage,
});

function CompanyInfoPage() {
  const [logo, setLogo] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLogo(ev.target?.result as string);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  return (
    <form className="grid grid-cols-[1fr_auto] bg-white p-6 rounded-lg shadow">
      {/* Left Column */}
      <div className="flex flex-col gap-4">
        <label className="flex flex-col text-sm font-medium gap-1">
          Name*
          <input name="name" required className="input input-bordered w-full" />
        </label>
        <label className="flex flex-col text-sm font-medium gap-1">
          Phone*
          <input
            name="phone"
            required
            className="input input-bordered w-full"
          />
        </label>
        <label className="flex flex-col text-sm font-medium gap-1">
          Email*
          <input
            name="email"
            type="email"
            required
            className="input input-bordered w-full"
          />
        </label>
        <label className="flex flex-col text-sm font-medium gap-1">
          Fax*
          <input name="fax" required className="input input-bordered w-full" />
        </label>
        <label className="flex flex-col text-sm font-medium gap-1">
          Tax ID*
          <input
            name="taxid"
            required
            className="input input-bordered w-full"
          />
        </label>
        {/* Optional fields in a single row, no gap */}
        <div className="flex gap-0">
          <input
            name="county"
            placeholder="County"
            className="input input-bordered rounded-r-none min-w-0"
          />
          <input
            name="district"
            placeholder="District"
            className="input input-bordered rounded-none border-l-0 min-w-0"
          />
          <input
            name="address"
            placeholder="Address"
            className="input input-bordered rounded-l-none border-l-0 min-w-0 flex-2"
          />
        </div>
      </div>
      {/* Right Column */}
      <div className="aspect-square  flex flex-col items-center justify-center bg-gray-50 rounded-lg border border-gray-200">
        <label className="w-full text-center text-sm font-medium">
          Logo (optional)
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleLogoChange}
          />
          <button
            type="button"
            className="mt-3 mb-2 px-4 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            onClick={() => fileInputRef.current?.click()}
          >
            {logo ? "Change Logo" : "Upload Logo"}
          </button>
        </label>
        {logo && (
          <img
            src={logo}
            alt="Logo Preview"
            className="w-28 h-28 object-contain border border-gray-300 rounded mt-2"
          />
        )}
      </div>
    </form>
  );
}
