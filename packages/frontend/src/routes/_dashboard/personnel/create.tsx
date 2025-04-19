import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/personnel/create")({
  component: PersonnelCreatePage,
});

function PersonnelCreatePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Personnel</h1>
      
      <div className="bg-white shadow rounded-lg p-6">
        <form className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                Employee ID
              </label>
              <input
                type="text"
                id="employeeId"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="E.g., EMP001"
              />
            </div>
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="E.g., John Doe"
              />
            </div>
            
            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Department</option>
                <option value="HR">Human Resources</option>
                <option value="IT">Information Technology</option>
                <option value="Finance">Finance</option>
                <option value="Production">Production</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Position
              </label>
              <input
                type="text"
                id="position"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                placeholder="E.g., Manager"
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
                placeholder="E.g., john.doe@example.com"
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
                placeholder="E.g., +1234567890"
              />
            </div>
            
            <div>
              <label htmlFor="joinDate" className="block text-sm font-medium text-gray-700">
                Join Date
              </label>
              <input
                type="date"
                id="joinDate"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Access Role
              </label>
              <select
                id="role"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="">Select Role</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee</option>
                <option value="readonly">Read Only</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Create Personnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
