import { createFileRoute } from '@tanstack/react-router'
import { Button } from '../components/ui/button'
export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <div className="p-8">
      <h1>townsqr - a meta workplace alternative</h1>
      <Button>Click me</Button>
    </div>
  )
}
