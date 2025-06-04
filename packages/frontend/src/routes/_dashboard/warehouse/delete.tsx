import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/warehouse/delete")({
  component: StorageDeletePage,
});

function StorageDeletePage() {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [storageToDelete, setStorageToDelete] = useState<string | null>(null);
  
  // Sample storage data
  const [storageData, setStorageData] = useState([
    { id: "WH001", name: "Main Warehouse", type: "warehouse", location: "Building A", capacity: 5000, unit: "pallets", status: "active", parent: null, currentOccupancy: 3200 },
    { id: "ZN001", name: "Zone A", type: "zone", location: "Building A, Floor 1", capacity: 1000, unit: "pallets", status: "active", parent: "WH001", currentOccupancy: 750 },
    { id: "ZN002", name: "Zone B", type: "zone", location: "Building A, Floor 2", capacity: 1200, unit: "pallets", status: "active", parent: "WH001", currentOccupancy: 900 },
    { id: "RK001", name: "Rack 1", type: "rack", location: "Zone A, Section 1", capacity: 100, unit: "boxes", status: "active", parent: "ZN001", currentOccupancy: 85 },
    { id: "RK002", name: "Rack 2", type: "rack", location: "Zone A, Section 2", capacity: 100, unit: "boxes", status: "active", parent: "ZN001", currentOccupancy: 65 },
    { id: "BN001", name: "Bin 1-A", type: "bin", location: "Rack 1, Level 1", capacity: 20, unit: "items", status: "full", parent: "RK001", currentOccupancy: 20 },
    { id: "WH002", name: "Cold Storage", type: "warehouse", location: "Building B", capacity: 2000, unit: "pallets", status: "active", parent: null, currentOccupancy: 1100 },
  ]);

  // Function to check if a storage has children
  const hasChildren = (storageId: string) => {
    return storageData.some(item => item.parent === storageId);
  };

  const handleDeleteClick = (storageId: string) => {
    setStorageToDelete(storageId);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    if (storageToDelete) {
      setStorageData(storageData.filter(item => item.id !== storageToDelete));
      setShowConfirmation(false);
      setStorageToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setStorageToDelete(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Delete Storage</h1>
      
      <div className="mb-4">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Warning:</strong> Deleting a storage location will permanently remove it from the system. If a storage has child locations, those must be deleted or reassigned first.
              </p>
            </div>
          </div>
        </div>
      </div>
      
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
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Has Children
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {hasChildren(storage.id) ? (
                    <span className="text-red-600">Yes</span>
                  ) : (
                    <span className="text-green-600">No</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDeleteClick(storage.id)}
                    className={`text-red-600 hover:text-red-900 ${hasChildren(storage.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    disabled={hasChildren(storage.id)}
                    title={hasChildren(storage.id) ? "Cannot delete storage with child locations" : "Delete storage"}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to delete this storage location? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDelete}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
