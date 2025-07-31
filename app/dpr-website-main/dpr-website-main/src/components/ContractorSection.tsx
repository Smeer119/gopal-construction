import React, { useState } from 'react'
import { Plus, User, Briefcase, Users, Edit3, Trash2, Save, X } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface Contractor {
  id: string
  name: string
  role: string
  manpower: number
  working_description: string
}

interface ContractorSectionProps {
  contractors: Contractor[]
  onAddContractor: (contractor: Omit<Contractor, 'id'>) => void
  onUpdateContractor: (id: string, contractor: Partial<Contractor>) => void
  onDeleteContractor: (id: string) => void
}

export const ContractorSection: React.FC<ContractorSectionProps> = ({
  contractors,
  onAddContractor,
  onUpdateContractor,
  onDeleteContractor
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    manpower: 0,
    working_description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      onUpdateContractor(editingId, formData)
      setEditingId(null)
    } else {
      onAddContractor(formData)
      setShowAddForm(false)
    }
    setFormData({ name: '', role: '', manpower: 0, working_description: '' })
  }

  const handleEdit = (contractor: Contractor) => {
    setFormData({
      name: contractor.name,
      role: contractor.role,
      manpower: contractor.manpower,
      working_description: contractor.working_description
    })
    setEditingId(contractor.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ name: '', role: '', manpower: 0, working_description: '' })
  }

  return (
    <AccordionCard title="Contractors" badge={contractors.length} defaultOpen>
      <div className="space-y-4">
        {contractors.map((contractor) => (
          <div key={contractor.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-blue-600" />
                  <h4 className="font-medium text-gray-800">{contractor.name}</h4>
                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {contractor.role}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm text-gray-600">{contractor.manpower} workers</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{contractor.working_description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(contractor)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteContractor(contractor.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(showAddForm || editingId) && (
          <form onSubmit={handleSubmit} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-blue-600" />
              {editingId ? 'Edit Contractor' : 'Add New Contractor'}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <input
                  type="text"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Site Supervisor, Project Manager"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Manpower Count</label>
                <input
                  type="number"
                  value={formData.manpower || ''}
                  onChange={(e) => setFormData({ ...formData, manpower: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter number of workers"
                  min="0"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Description</label>
                <textarea
                  value={formData.working_description}
                  onChange={(e) => setFormData({ ...formData, working_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the work being performed (optional)..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Contractor
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
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Contractor
          </button>
        )}
      </div>
    </AccordionCard>
  )
}