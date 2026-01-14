import React from "react"
import { CheckCircle, AlertCircle } from "lucide-react"

interface StatusBadgeProps {
  isValid: boolean
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ isValid }) => {
  return (
    <div className="flex items-center gap-2">
      {isValid ? (
        <div className="flex items-center gap-1 text-green-600 dark:text-green-500">
          <CheckCircle size={16} />
          <span className="text-sm">Yaroqli JWT</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-red-600 dark:text-red-500">
          <AlertCircle size={16} />
          <span className="text-sm">Yaroqsiz JWT</span>
        </div>
      )}
    </div>
  )
}

export default StatusBadge
