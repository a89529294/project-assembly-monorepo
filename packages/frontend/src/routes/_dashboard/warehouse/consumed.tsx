import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_dashboard/warehouse/consumed')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_dashboard/warehouse/consumed"!</div>
}
