import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/basic-info/update")({
  component: BasicInfoUpdatePage,
});

function BasicInfoUpdatePage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  
  // Sample basic info data
  const basicInfoData = [
    { id: "CUST001", category: "customer", name: "ABC Corporation", description: "Major retail client", status: "active", group: "Retail", contact: "John Smith", email: "john@abc.com", phone: "+1234567890", address: "123 Main St, Anytown, USA" },
    { id: "SUPP001", category: "supplier", name: "XYZ Suppliers", description: "Raw materials supplier", status: "active", group: "Materials", contact: "Jane Doe", email: "jane@xyz.com", phone: "+1987654321", address: "456 Oak Ave, Somewhere, USA" },
    { id: "PROD001", category: "product", name: "Widget A", description: "Standard widget", status: "active", group: "Widgets", specs: "10x15x5cm", price: "$45.99", sku: "WID-A-001" },
    { id: "MAT001", category: "material", name: "Steel Type B", description: "Industrial grade steel", status: "active", group: "Metals", quantity: "500 units", location: "Warehouse B", unitPrice: "$12.50" },
    { id: "CUST002", category: "customer", name: "123 Industries", description: "Manufacturing client", status: "inactive", group: "Manufacturing", contact: "Robert Brown", email: "robert@123ind.com", phone: "+1122334455", address: "789 Pine Rd, Elsewhere, USA" },
  ];

  const filteredData = activeCategory === "all" 
    ? basicInfoData 
    : basicInfoData.filter(item => item.category === activeCategory);
    
  const selectedItemData = basicInfoData.find(item => item.id === selectedItem);

  const renderUpdateForm = () => {
    if (!selectedItemData) return null;
    
    // Common fields for all categories
    const commonFields = (
      <>
        <div>
          <label htmlFor="id" className="block text-sm font-medium text-gray-700">
            ID
          </label>
          <input
            type="text"
            id="id"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
            value={selectedItemData.id}
            readOnly
          />
        </div>
        
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Category
          </label>
          <input
            type="text"
            id="category"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100 capitalize"
            value={selectedItemData.category}
            readOnly
          />
        </div>
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            defaultValue={selectedItemData.name}
          />
        </div>
        
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description
          </label>
          <input
            type="text"
            id="description"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            defaultValue={selectedItemData.description}
          />
        </div>
        
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="status"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            defaultValue={selectedItemData.status}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700">
            Group
          </label>
          <input
            type="text"
            id="group"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            defaultValue={selectedItemData.group}
          />
        </div>
      </>
    );
    
    // Category-specific fields
    let categoryFields = null;
    
    if (selectedItemData.category === "customer" || selectedItemData.category === "supplier") {
      categoryFields = (
        <>
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
              Contact Person
            </label>
            <input
              type="text"
              id="contact"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.contact}
            />
          </div>
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.email}
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.phone}
            />
          </div>
          
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.address}
            />
          </div>
        </>
      );
    } else if (selectedItemData.category === "product") {
      categoryFields = (
        <>
          <div>
            <label htmlFor="specs" className="block text-sm font-medium text-gray-700">
              Specifications
            </label>
            <input
              type="text"
              id="specs"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.specs}
            />
          </div>
          
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">
              Price
            </label>
            <input
              type="text"
              id="price"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.price}
            />
          </div>
          
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              SKU
            </label>
            <input
              type="text"
              id="sku"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.sku}
            />
          </div>
        </>
      );
    } else if (selectedItemData.category === "material") {
      categoryFields = (
        <>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="text"
              id="quantity"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.quantity}
            />
          </div>
          
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">
              Location
            </label>
            <input
              type="text"
              id="location"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.location}
            />
          </div>
          
          <div>
            <label htmlFor="unitPrice" className="block text-sm font-medium text-gray-700">
              Unit Price
            </label>
            <input
              type="text"
              id="unitPrice"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              defaultValue={selectedItemData.unitPrice}
            />
          </div>
        </>
      );
    }
    
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          Edit {selectedItemData.category.charAt(0).toUpperCase() + selectedItemData.category.slice(1)}: {selectedItemData.name}
        </h2>
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {commonFields}
          </div>
          
          {categoryFields && (
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-medium mb-3">Additional Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryFields}
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
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
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Update Basic Info</h1>
      
      {!selectedItem ? (
        <>
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
                        onClick={() => setSelectedItem(item.id)}
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
        </>
      ) : (
        renderUpdateForm()
      )}
    </div>
  );
}
