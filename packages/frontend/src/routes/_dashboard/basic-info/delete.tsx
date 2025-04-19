import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/basic-info/delete")({
  component: BasicInfoDeletePage,
});

function BasicInfoDeletePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Sample basic info data
  const [basicInfoData, setBasicInfoData] = useState([
    { id: "CUST001", category: "customer", name: "ABC Corporation", description: "Major retail client", status: "active", group: "Retail" },
    { id: "SUPP001", category: "supplier", name: "XYZ Suppliers", description: "Raw materials supplier", status: "active", group: "Materials" },
    { id: "PROD001", category: "product", name: "Widget A", description: "Standard widget", status: "active", group: "Widgets" },
    { id: "MAT001", category: "material", name: "Steel Type B", description: "Industrial grade steel", status: "active", group: "Metals" },
    { id: "CUST002", category: "customer", name: "123 Industries", description: "Manufacturing client", status: "inactive", group: "Manufacturing" },
  ]);

  const filteredData = activeCategory === "all" 
    ? basicInfoData 
    : basicInfoData.filter(item => item.category === activeCategory);

  const handleDeleteClick = (itemId: string) => {
    setItemToDelete(itemId);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      setBasicInfoData(basicInfoData.filter(item => item.id !== itemToDelete));
      setShowConfirmation(false);
      setItemToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setItemToDelete(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Delete Basic Info</h1>
      
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
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDeleteClick(item.id)}
                    className="text-red-600 hover:text-red-900"
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
              Are you sure you want to delete this item? This action cannot be undone.
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
