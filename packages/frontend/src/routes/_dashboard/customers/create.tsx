import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/customers/create')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/customer/create"!</div>
}
