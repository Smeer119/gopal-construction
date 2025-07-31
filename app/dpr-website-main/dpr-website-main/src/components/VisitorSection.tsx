import React, { useState } from 'react'
import { Plus, Users, Edit3, Trash2, Save, X } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface Visitor {
  id: string
  visitor_types: string[]
  visit_description: string
}

interface VisitorSectionProps {
  visitors: Visitor[]
  onAddVisitor: (visitor: Omit<Visitor, 'id'>) => void
  onUpdateVisitor: (id: string, visitor: Partial<Visitor>) => void
  onDeleteVisitor: (id: string) => void
}

const visitorTypes = [
  'Customer', 'Owner', 'Client', 'Architect', 'Consultant', 
  'Senior Manager', 'Vendor', 'Contractor', 'Inspector', 'Engineer'
]

export const VisitorSection: React.FC<VisitorSectionProps> = ({
  visitors,
  onAddVisitor,
  onUpdateVisitor,
  onDeleteVisitor
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    visitor_types: [] as string[],
    visit_description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      onUpdateVisitor(editingId, formData)
      setEditingId(null)
    } else {
      onAddVisitor(formData)
      setShowAddForm(false)
    }
    setFormData({ visitor_types: [], visit_description: '' })
  }

  const handleEdit = (visitor: Visitor) => {
    setFormData({
      visitor_types: visitor.visitor_types,
      visit_description: visitor.visit_description
    })
    setEditingId(visitor.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ visitor_types: [], visit_description: '' })
  }

  const toggleVisitorType = (type: string) => {
    setFormData(prev => ({
      ...prev,
      visitor_types: prev.visitor_types.includes(type)
        ? prev.visitor_types.filter(t => t !== type)
        : [...prev.visitor_types, type]
    }))
  }

  return (
    <AccordionCard title="Today's Visitors" badge={visitors.length}>
      <div className="space-y-4">
        {visitors.map((visitor) => (
          <div key={visitor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  <h4 className="font-medium text-gray-800">Visitors</h4>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {visitor.visitor_types.map((type, index) => (
                    <span key={index} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {type}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-gray-600">{visitor.visit_description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(visitor)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteVisitor(visitor.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(showAddForm || editingId) && (
          <form onSubmit={handleSubmit} className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-600" />
              {editingId ? 'Edit Visitor Entry' : 'Add Visitor Entry'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visitor Types</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {visitorTypes.map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.visitor_types.includes(type)}
                        onChange={() => toggleVisitorType(type)}
                        className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-700">{type}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Visit Description/Purpose</label>
                <textarea
                  value={formData.visit_description}
                  onChange={(e) => setFormData({ ...formData, visit_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the purpose of visit (optional)..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Visitor
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

        {!showAddForm && !editingId && (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full flex items-center justify-center gap-2 bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Visitor Entry
          </button>
        )}
      </div>
    </AccordionCard>
  )
}