import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/storage/update")({
  component: StorageUpdatePage,
});

function StorageUpdatePage() {
  const [selectedStorage, setSelectedStorage] = useState<string | null>(null);
  
  // Sample storage data
  const storageData = [
    { id: "WH001", name: "Main Warehouse", type: "warehouse", location: "Building A", capacity: 5000, unit: "pallets", status: "active", parent: null, currentOccupancy: 3200, description: "Main storage facility for finished goods", temperature: { min: 15, max: 25 }, humidity: { min: 40, max: 60 }, specialConditions: "none" },
    { id: "ZN001", name: "Zone A", type: "zone", location: "Building A, Floor 1", capacity: 1000, unit: "pallets", status: "active", parent: "WH001", currentOccupancy: 750, description: "Primary zone for large items", temperature: { min: 15, max: 25 }, humidity: { min: 40, max: 60 }, specialConditions: "none" },
    { id: "ZN002", name: "Zone B", type: "zone", location: "Building A, Floor 2", capacity: 1200, unit: "pallets", status: "active", parent: "WH001", currentOccupancy: 900, description: "Secondary zone for medium items", temperature: { min: 15, max: 25 }, humidity: { min: 40, max: 60 }, specialConditions: "none" },
    { id: "RK001", name: "Rack 1", type: "rack", location: "Zone A, Section 1", capacity: 100, unit: "boxes", status: "active", parent: "ZN001", currentOccupancy: 85, description: "Heavy-duty rack for boxed items", temperature: { min: 15, max: 25 }, humidity: { min: 40, max: 60 }, specialConditions: "none" },
    { id: "RK002", name: "Rack 2", type: "rack", location: "Zone A, Section 2", capacity: 100, unit: "boxes", status: "active", parent: "ZN001", currentOccupancy: 65, description: "Standard rack for boxed items", temperature: { min: 15, max: 25 }, humidity: { min: 40, max: 60 }, specialConditions: "none" },
    { id: "BN001", name: "Bin 1-A", type: "bin", location: "Rack 1, Level 1", capacity: 20, unit: "items", status: "full", parent: "RK001", currentOccupancy: 20, description: "Small parts bin", temperature: { min: 15, max: 25 }, humidity: { min: 40, max: 60 }, specialConditions: "none" },
    { id: "WH002", name: "Cold Storage", type: "warehouse", location: "Building B", capacity: 2000, unit: "pallets", status: "active", parent: null, currentOccupancy: 1100, description: "Temperature controlled storage for perishable goods", temperature: { min: 2, max: 8 }, humidity: { min: 30, max: 50 }, specialConditions: "refrigerated" },
  ];

  const selectedStorageData = storageData.find(s => s.id === selectedStorage);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Update Storage</h1>
      
      {!selectedStorage ? (
        <div>
          <p className="mb-4">Select a storage location to update:</p>
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {storageData.map((storage) => (
                  <tr key={storage.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {storage.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {storage.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                      {storage.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {storage.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        storage.status === "active" ? "bg-green-100 text-green-800" : 
                        storage.status === "full" ? "bg-orange-100 text-orange-800" :
                        storage.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>
                        {storage.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button 
                        onClick={() => setSelectedStorage(storage.id)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">
            Edit Storage: {selectedStorageData?.name}
          </h2>
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="storageId" className="block text-sm font-medium text-gray-700">
                  Storage ID
                </label>
                <input
                  type="text"
                  id="storageId"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                  value={selectedStorageData?.id}
                  readOnly
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
                  defaultValue={selectedStorageData?.name}
                />
              </div>
              
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Storage Type
                </label>
                <select
                  id="type"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={selectedStorageData?.type}
                >
                  <option value="warehouse">Warehouse</option>
                  <option value="zone">Zone</option>
                  <option value="rack">Rack</option>
                  <option value="shelf">Shelf</option>
                  <option value="bin">Bin</option>
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
                  defaultValue={selectedStorageData?.location}
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
                  defaultValue={selectedStorageData?.capacity}
                />
              </div>
              
              <div>
                <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
                  Capacity Unit
                </label>
                <select
                  id="unit"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={selectedStorageData?.unit}
                >
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
                  defaultValue={selectedStorageData?.status}
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
                  defaultValue={selectedStorageData?.parent || ""}
                >
                  <option value="">None (Top Level)</option>
                  {storageData
                    .filter(s => s.id !== selectedStorageData?.id)
                    .map(s => (
                      <option key={s.id} value={s.id}>
                        {s.id} - {s.name}
                      </option>
                    ))
                  }
                </select>
              </div>
              
              <div>
                <label htmlFor="currentOccupancy" className="block text-sm font-medium text-gray-700">
                  Current Occupancy
                </label>
                <input
                  type="number"
                  id="currentOccupancy"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  defaultValue={selectedStorageData?.currentOccupancy}
                />
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
                defaultValue={selectedStorageData?.description}
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
                      defaultValue={selectedStorageData?.temperature?.min}
                    />
                    <span className="mt-2">-</span>
                    <input
                      type="number"
                      id="maxTemp"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="Max"
                      defaultValue={selectedStorageData?.temperature?.max}
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
                      defaultValue={selectedStorageData?.humidity?.min}
                    />
                    <span className="mt-2">-</span>
                    <input
                      type="number"
                      id="maxHumidity"
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                      placeholder="Max"
                      defaultValue={selectedStorageData?.humidity?.max}
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
                    defaultValue={selectedStorageData?.specialConditions}
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
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setSelectedStorage(null)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
