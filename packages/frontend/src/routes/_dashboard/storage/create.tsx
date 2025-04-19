import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/storage/create")({
  component: StorageCreatePage,
});

function StorageCreatePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Storage Entry</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="storageId" className="block text-sm font-medium text-gray-700">
                Storage ID
              </label>
              <input
                type="text"
                id="storageId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="E.g., WH001"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Storage Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="E.g., Main Warehouse"
              />
            </div>
            
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                Storage Type
              </label>
              <select
                id="type"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Type</option>
                <option value="warehouse">Warehouse</option>
                <option value="shelf">Shelf</option>
                <option value="rack">Rack</option>
                <option value="bin">Bin</option>
                <option value="zone">Zone</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="E.g., Building A, Floor 2"
              />
            </div>
            
            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700">
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="Maximum capacity"
              />
            </div>
            
            <div>
              <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                Capacity Unit
              </label>
              <select
                id="unit"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Unit</option>
                <option value="items">Items</option>
                <option value="pallets">Pallets</option>
                <option value="boxes">Boxes</option>
                <option value="kg">Kilograms</option>
                <option value="tons">Tons</option>
                <option value="cubic_meters">Cubic Meters</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                id="status"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Under Maintenance</option>
                <option value="full">Full</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="parent" className="block text-sm font-medium text-gray-700">
                Parent Storage
              </label>
              <select
                id="parent"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">None (Top Level)</option>
                <option value="WH001">WH001 - Main Warehouse</option>
                <option value="WH002">WH002 - Secondary Warehouse</option>
                <option value="ZN001">ZN001 - Zone A</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Additional details about this storage location"
            ></textarea>
          </div>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="text-lg font-medium mb-3">Environmental Conditions</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                  Temperature Range (°C)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    id="minTemp"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Min"
                  />
                  <span className="mt-2">-</span>
                  <input
                    type="number"
                    id="maxTemp"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Max"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="humidity" className="block text-sm font-medium text-gray-700">
                  Humidity Range (%)
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    id="minHumidity"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Min"
                  />
                  <span className="mt-2">-</span>
                  <input
                    type="number"
                    id="maxHumidity"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    placeholder="Max"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="specialConditions" className="block text-sm font-medium text-gray-700">
                  Special Conditions
                </label>
                <select
                  id="specialConditions"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="none">None</option>
                  <option value="refrigerated">Refrigerated</option>
                  <option value="frozen">Frozen</option>
                  <option value="hazardous">Hazardous Materials</option>
                  <option value="fragile">Fragile Items</option>
                  <option value="secure">High Security</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Storage
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
