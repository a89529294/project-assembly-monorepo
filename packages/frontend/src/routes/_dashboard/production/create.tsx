import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/production/create")({
  component: ProductionCreatePage,
});

function ProductionCreatePage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Create Production</h1>
      <p>This is the production creation page.</p>
    </div>
  );
}
