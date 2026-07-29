import { AlertCircle, CheckCircle } from "lucide-react"
import type React from "react"

interface StatusBadgeProps {
  isValid: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isValid }) => {
  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <div className="flex items-center gap-1 text-success">
          <CheckCircle size={16} />
          <span className="text-sm">Yaroqli JWT</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-destructive">
          <AlertCircle size={16} />
          <span className="text-sm">Yaroqsiz JWT</span>
        </div>
      )}
    </div>
  )
}

export default StatusBadge
