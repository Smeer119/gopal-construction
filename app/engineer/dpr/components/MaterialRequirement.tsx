import React, { useState } from 'react'
import { Edit3, Trash2, Save, X, Plus } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface MaterialRequirement {
  id: string
  description: string
}

interface MaterialRequirementSectionProps {
  requirements: MaterialRequirement[]
  onAddRequirement: (requirement: Omit<MaterialRequirement, 'id'>) => void
  onUpdateRequirement: (id: string, requirement: Partial<MaterialRequirement>) => void
  onDeleteRequirement: (id: string) => void
}

export const MaterialRequirementSection: React.FC<MaterialRequirementSectionProps> = ({
  requirements,
  onAddRequirement,
  onUpdateRequirement,
  onDeleteRequirement
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [description, setDescription] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      onUpdateRequirement(editingId, { description })
      setEditingId(null)
    } else {
      onAddRequirement({ description })
    }
    setDescription('')
    setShowForm(false)
  }

  const handleEdit = (id: string, currentDescription: string) => {
    setEditingId(id)
    setDescription(currentDescription)
    setShowForm(true)
  }

  const handleCancel = () => {
    setEditingId(null)
    setDescription('')
    setShowForm(false)
  }
  

  return (
    <AccordionCard title="Material Requirements" badge={requirements.length}>
      <div className="space-y-4">
        {requirements.map((item) => (
          <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-start">
            <p className="text-sm text-gray-700 flex-1">{item.description}</p>
            <div className="flex gap-2 ml-4">
              <button
                onClick={() => handleEdit(item.id, item.description)}
                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteRequirement(item.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {showForm && (
          <form onSubmit={handleSubmit} className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <h4 className="font-medium text-gray-800 mb-4">
              {editingId ? 'Edit Requirement' : 'Add Material Requirement'}
            </h4>
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                rows={3}
                placeholder="Enter material requirement details..."
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Requirement
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </form>
        )}

        {!showForm && !editingId && (
          <button
            onClick={() => setShowForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Material Requirement
          </button>
        )}
      </div>
    </AccordionCard>
  )
}
