import { Button } from "./button"
import { LucideIcon, Plus } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: {
    label: string
    onClick: () => void
    icon?: LucideIcon
  }
}

const styles = {
  container: `
    flex
    flex-col
    items-center
    justify-center
    py-12
    px-4
    border
    border-dashed
    border-border-color
    rounded-[12px]
    bg-card/50
    text-center
    space-y-4
  `,
  title: `
    text-lg
    font-medium
    text-muted-foreground
  `,
  description: `
    text-sm
    text-muted-foreground/80
  `
}

export const EmptyState = ({ title, description, icon: Icon, action }: EmptyStateProps) => {
  return (
    <div className={styles.container}>
      {Icon && <Icon className="w-12 h-12 text-muted-foreground/50 mb-2" />}
      <h3 className={styles.title}>{title}</h3>
      {description && <p className={styles.description}>{description}</p>}
      {action && (
        <Button
          onClick={action.onClick}
          variant="outline"
          className="mt-2"
        >
          {action.icon && <action.icon className="w-4 h-4 mr-2" />}
          {action.label}
        </Button>
      )}
    </div>
  )
} 