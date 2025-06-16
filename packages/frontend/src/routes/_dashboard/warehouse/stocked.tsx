import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/warehouse/stocked')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/warehouse/stocked"!</div>
}
