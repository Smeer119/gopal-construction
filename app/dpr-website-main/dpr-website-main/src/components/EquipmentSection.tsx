import React, { useState } from 'react'
import { Plus, Truck, Clock, Edit3, Trash2, Save, X } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface Equipment {
  id: string
  machine_type: string
  from_time: string
  to_time: string
  working_description: string
}

interface EquipmentSectionProps {
  equipment: Equipment[]
  onAddEquipment: (equipment: Omit<Equipment, 'id'>) => void
  onUpdateEquipment: (id: string, equipment: Partial<Equipment>) => void
  onDeleteEquipment: (id: string) => void
}

const machineTypes = [
  'Concrete Mixer', 'JCB Excavator', 'Tower Crane', 'Mobile Crane', 'Bulldozer',
  'Dumper Truck', 'Concrete Pump', 'Roller Compactor', 'Grader', 'Backhoe Loader',
  'Forklift', 'Welding Machine', 'Cutting Machine', 'Drilling Machine'
]

export const EquipmentSection: React.FC<EquipmentSectionProps> = ({
  equipment,
  onAddEquipment,
  onUpdateEquipment,
  onDeleteEquipment
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    machine_type: '',
    from_time: '',
    to_time: '',
    working_description: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      onUpdateEquipment(editingId, formData)
      setEditingId(null)
    } else {
      onAddEquipment(formData)
      setShowAddForm(false)
    }
    setFormData({ machine_type: '', from_time: '', to_time: '', working_description: '' })
  }

  const handleEdit = (eq: Equipment) => {
    setFormData({
      machine_type: eq.machine_type,
      from_time: eq.from_time,
      to_time: eq.to_time,
      working_description: eq.working_description
    })
    setEditingId(eq.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ machine_type: '', from_time: '', to_time: '', working_description: '' })
  }

  const formatTime = (time: string) => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <AccordionCard title="Equipment & Machinery" badge={equipment.length}>
      <div className="space-y-4">
        {equipment.map((eq) => (
          <div key={eq.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-4 h-4 text-orange-600" />
                  <h4 className="font-medium text-gray-800">{eq.machine_type}</h4>
                </div>
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm text-gray-600">
                      {formatTime(eq.from_time)} - {formatTime(eq.to_time)}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{eq.working_description}</p>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(eq)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteEquipment(eq.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(showAddForm || editingId) && (
          <form onSubmit={handleSubmit} className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Truck className="w-4 h-4 text-orange-600" />
              {editingId ? 'Edit Equipment' : 'Add Equipment'}
            </h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Type</label>
                <select
                  value={formData.machine_type}
                  onChange={(e) => setFormData({ ...formData, machine_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  <option value="">Select machine type</option>
                  {machineTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From Time</label>
                  <input
                    type="time"
                    value={formData.from_time}
                    onChange={(e) => setFormData({ ...formData, from_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To Time</label>
                  <input
                    type="time"
                    value={formData.to_time}
                    onChange={(e) => setFormData({ ...formData, to_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Description</label>
                <textarea
                  value={formData.working_description}
                  onChange={(e) => setFormData({ ...formData, working_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the work being performed (optional)..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Equipment
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
            className="w-full flex items-center justify-center gap-2 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Equipment
          </button>
        )}
      </div>
    </AccordionCard>
  )
}