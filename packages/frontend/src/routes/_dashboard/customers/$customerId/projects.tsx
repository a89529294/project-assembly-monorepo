import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/customers/$customerId/projects',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/customers/$customerId/projects"!</div>
}
