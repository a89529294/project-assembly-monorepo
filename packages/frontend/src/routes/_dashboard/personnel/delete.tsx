import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/_dashboard/personnel/delete")({
  component: PersonnelDeletePage,
});

function PersonnelDeletePage() {
  const [personnel, setPersonnel] = useState([
    { id: "EMP001", name: "John Doe", department: "IT", position: "Manager", email: "john.doe@example.com", phone: "+1234567890", joinDate: "2023-01-15" },
    { id: "EMP002", name: "Jane Smith", department: "HR", position: "Director", email: "jane.smith@example.com", phone: "+1987654321", joinDate: "2022-05-20" },
    { id: "EMP003", name: "Robert Johnson", department: "Finance", position: "Accountant", email: "robert.j@example.com", phone: "+1122334455", joinDate: "2024-02-10" },
    { id: "EMP004", name: "Emily Davis", department: "Production", position: "Supervisor", email: "emily.d@example.com", phone: "+1567890123", joinDate: "2023-11-05" },
  ]);
  
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);

  const handleDeleteClick = (employeeId: string) => {
    setEmployeeToDelete(employeeId);
    setShowConfirmation(true);
  };

  const confirmDelete = () => {
    if (employeeToDelete) {
      setPersonnel(personnel.filter(person => person.id !== employeeToDelete));
      setShowConfirmation(false);
      setEmployeeToDelete(null);
    }
  };

  const cancelDelete = () => {
    setShowConfirmation(false);
    setEmployeeToDelete(null);
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Delete Personnel</h1>
      
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
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Position
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {personnel.map((person) => (
              <tr key={person.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {person.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {person.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button 
                    onClick={() => handleDeleteClick(person.id)}
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
              Are you sure you want to delete this employee? This action cannot be undone.
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
