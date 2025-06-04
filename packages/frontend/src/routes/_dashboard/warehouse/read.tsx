import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/warehouse/read")({
  component: StorageReadPage,
});

function StorageReadPage() {
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('list');
  
  // Sample storage data
  const storageData = [
    { id: "WH001", name: "Main Warehouse", type: "warehouse", location: "Building A", capacity: 5000, unit: "pallets", status: "active", parent: null, currentOccupancy: 3200 },
    { id: "ZN001", name: "Zone A", type: "zone", location: "Building A, Floor 1", capacity: 1000, unit: "pallets", status: "active", parent: "WH001", currentOccupancy: 750 },
    { id: "ZN002", name: "Zone B", type: "zone", location: "Building A, Floor 2", capacity: 1200, unit: "pallets", status: "active", parent: "WH001", currentOccupancy: 900 },
    { id: "RK001", name: "Rack 1", type: "rack", location: "Zone A, Section 1", capacity: 100, unit: "boxes", status: "active", parent: "ZN001", currentOccupancy: 85 },
    { id: "RK002", name: "Rack 2", type: "rack", location: "Zone A, Section 2", capacity: 100, unit: "boxes", status: "active", parent: "ZN001", currentOccupancy: 65 },
    { id: "BN001", name: "Bin 1-A", type: "bin", location: "Rack 1, Level 1", capacity: 20, unit: "items", status: "full", parent: "RK001", currentOccupancy: 20 },
    { id: "WH002", name: "Cold Storage", type: "warehouse", location: "Building B", capacity: 2000, unit: "pallets", status: "active", parent: null, currentOccupancy: 1100 },
  ];

  // Function to render the hierarchy view
  const renderHierarchy = (parentId: string | null, level: number = 0) => {
    const children = storageData.filter(item => item.parent === parentId);
    
    if (children.length === 0) return null;
    
    return (
      <ul className={`pl-${level > 0 ? 6 : 0}`}>
        {children.map(item => (
          <li key={item.id} className="mb-2">
            <div className={`flex items-center p-2 ${level > 0 ? 'border-l-2 border-gray-300 pl-4' : ''}`}>
              <div className="flex-1">
                <div className="flex items-center">
                  {item.type === "warehouse" && (
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  )}
                  {item.type === "zone" && (
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  )}
                  {(item.type === "rack" || item.type === "shelf") && (
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                  )}
                  {item.type === "bin" && (
                    <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                  )}
                  <span className="font-medium">{item.id} - {item.name}</span>
                </div>
                <div className="text-sm text-gray-500 ml-7">
                  {item.location} • {item.currentOccupancy}/{item.capacity} {item.unit} • 
                  <span className={`ml-1 ${
                    item.status === "active" ? "text-green-600" : 
                    item.status === "full" ? "text-orange-600" : 
                    item.status === "maintenance" ? "text-yellow-600" : "text-red-600"
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
              <div>
                <a href="#" className="text-indigo-600 hover:text-indigo-900 text-sm">
                  View Details
                </a>
              </div>
            </div>
            {renderHierarchy(item.id, level + 1)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Storage Locations</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search storage..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select className="border border-gray-300 rounded-md shadow-sm p-2">
            <option value="all">All Types</option>
            <option value="warehouse">Warehouses</option>
            <option value="zone">Zones</option>
            <option value="rack">Racks</option>
            <option value="bin">Bins</option>
          </select>
          
          <select className="border border-gray-300 rounded-md shadow-sm p-2">
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="maintenance">Maintenance</option>
            <option value="full">Full</option>
          </select>
          
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                viewMode === 'list'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('hierarchy')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                viewMode === 'hierarchy'
                  ? 'bg-indigo-50 border-indigo-500 text-indigo-600'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hierarchy View
            </button>
          </div>
        </div>
      </div>
      
      {viewMode === 'list' ? (
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
                  Capacity
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {storage.capacity} {storage.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${
                            (storage.currentOccupancy / storage.capacity) > 0.9 ? 'bg-red-500' :
                            (storage.currentOccupancy / storage.capacity) > 0.7 ? 'bg-yellow-500' : 'bg-green-500'
                          }`} 
                          style={{ width: `${(storage.currentOccupancy / storage.capacity) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm text-gray-500">
                        {Math.round((storage.currentOccupancy / storage.capacity) * 100)}%
                      </span>
                    </div>
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
                    <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4">
                      View
                    </a>
                    <a href="#" className="text-indigo-600 hover:text-indigo-900 mr-4">
                      Edit
                    </a>
                    <a href="#" className="text-red-600 hover:text-red-900">
                      Delete
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Storage Hierarchy</h2>
          <div className="border-t pt-4">
            {renderHierarchy(null)}
          </div>
        </div>
      )}
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{storageData.length}</span> storage locations
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" disabled>
            Previous
          </button>
          <button className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" disabled>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
