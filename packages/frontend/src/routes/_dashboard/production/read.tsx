import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/production/read")({
  loader: async ({ context }) => {
    const r = await fetch("http://localhost:3000/production", {
      headers: {
        Authorization: `Bearer ${context.auth.sessionToken}`,
      },
    });

    if (!r.ok) {
      throw redirect({ to: "/" });
    }
  },
  component: ProductionReadPage,
});

function ProductionReadPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Production List</h1>
      <div className="bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Date
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Sample data rows */}
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                P001
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Product A
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                2025-04-01
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </a>
                <a href="#" className="text-red-600 hover:text-red-900">
                  Delete
                </a>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                P002
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Product B
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                  Pending
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                2025-04-05
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                >
                  Edit
                </a>
                <a href="#" className="text-red-600 hover:text-red-900">
                  Delete
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
