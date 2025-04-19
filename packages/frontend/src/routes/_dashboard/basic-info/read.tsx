import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/basic-info/read")({
  component: BasicInfoReadPage,
});

function BasicInfoReadPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  
  // Sample basic info data
  const basicInfoData = [
    { id: "CUST001", category: "customer", name: "ABC Corporation", description: "Major retail client", status: "active", group: "Retail", contact: "John Smith", email: "john@abc.com", phone: "+1234567890" },
    { id: "SUPP001", category: "supplier", name: "XYZ Suppliers", description: "Raw materials supplier", status: "active", group: "Materials", contact: "Jane Doe", email: "jane@xyz.com", phone: "+1987654321" },
    { id: "PROD001", category: "product", name: "Widget A", description: "Standard widget", status: "active", group: "Widgets", specs: "10x15x5cm", price: "$45.99" },
    { id: "MAT001", category: "material", name: "Steel Type B", description: "Industrial grade steel", status: "active", group: "Metals", quantity: "500 units", location: "Warehouse B" },
    { id: "CUST002", category: "customer", name: "123 Industries", description: "Manufacturing client", status: "inactive", group: "Manufacturing", contact: "Robert Brown", email: "robert@123ind.com", phone: "+1122334455" },
  ];

  const filteredData = activeCategory === "all" 
    ? basicInfoData 
    : basicInfoData.filter(item => item.category === activeCategory);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Basic Information</h1>
      
      <div className="mb-6">
        <div className="flex flex-wrap border-b">
          <button
            className={`px-4 py-2 font-medium text-sm ${activeCategory === 'all' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeCategory === 'customer' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('customer')}
          >
            Customers
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeCategory === 'supplier' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('supplier')}
          >
            Suppliers
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeCategory === 'product' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('product')}
          >
            Products
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${activeCategory === 'material' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            onClick={() => setActiveCategory('material')}
          >
            Materials
          </button>
        </div>
      </div>
      
      <div className="mb-4 flex justify-between items-center">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        <div>
          <select className="border border-gray-300 rounded-md shadow-sm p-2">
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
            <option value="all">All Status</option>
          </select>
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
                Category
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Group
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredData.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    item.status === "active" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-red-100 text-red-800"
                  }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.group}
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
      
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">{filteredData.length}</span> results
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
