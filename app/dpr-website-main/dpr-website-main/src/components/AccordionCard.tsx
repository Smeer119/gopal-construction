import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface AccordionCardProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  badge?: string | number
}

export const AccordionCard: React.FC<AccordionCardProps> = ({ 
  title, 
  children, 
  defaultOpen = false,
  badge 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-slate-50 to-gray-50 hover:from-slate-100 hover:to-gray-100 transition-all duration-200 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
          </div>
          {badge !== undefined && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {badge}
            </span>
          )}
        </div>
      </button>
      
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'opacity-100 max-h-none' : 'opacity-0 max-h-0'
      }`}>
        <div className="p-6 pt-4 w-full">
          {children}
        </div>
      </div>
    </div>
  )
}