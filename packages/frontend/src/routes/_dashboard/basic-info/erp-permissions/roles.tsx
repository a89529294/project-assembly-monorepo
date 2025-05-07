import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute(
  '/_dashboard/basic-info/erp-permissions/roles',
)({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/basic-info/erp-permissions/roles"!</div>
}
