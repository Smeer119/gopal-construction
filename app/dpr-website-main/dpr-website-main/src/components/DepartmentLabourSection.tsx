import React, { useState } from 'react'
import { Plus, HardHat, Users, Edit3, Trash2, Save, X, User } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface GenderLabour {
  id: string
  gender: string
  manpower: number
}

export interface SkilledWorker {
  id: string
  skilled_worker: string
  skilled_manpower: number
  working_description?: string
}

export interface DepartmentLabour {
  genderLabours: GenderLabour[]
  skilledWorkers: SkilledWorker[]
}

interface DepartmentLabourSectionProps {
  labours: DepartmentLabour
  onUpdateLabours: (labours: DepartmentLabour) => void
}

const genderOptions = ['Male', 'Female']
const skilledWorkerTypes = ['Painter', 'Mason', 'Tiling', 'Welding', 'Electrical', 'Plumbing', 'Carpentry', 'Steel Fixing']

export const DepartmentLabourSection: React.FC<DepartmentLabourSectionProps> = ({
  labours,
  onUpdateLabours
}) => {
  // Gender Labour States
  const [showGenderForm, setShowGenderForm] = useState(false)
  const [editingGenderId, setEditingGenderId] = useState<string | null>(null)
  const [genderFormData, setGenderFormData] = useState({
    gender: '',
    manpower: 0
  })

  // Skilled Worker States
  const [showSkilledForm, setShowSkilledForm] = useState(false)
  const [editingSkilledId, setEditingSkilledId] = useState<string | null>(null)
  const [skilledFormData, setSkilledFormData] = useState({
    skilled_worker: '',
    skilled_manpower: 0,
    working_description: ''
  })

  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Gender Labour Handlers
  const handleGenderSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingGenderId) {
      const updatedGenderLabours = labours.genderLabours.map(g => 
        g.id === editingGenderId ? { ...g, ...genderFormData } : g
      )
      onUpdateLabours({ ...labours, genderLabours: updatedGenderLabours })
      setEditingGenderId(null)
    } else {
      const newGenderLabour = { ...genderFormData, id: generateId() }
      onUpdateLabours({ 
        ...labours, 
        genderLabours: [...labours.genderLabours, newGenderLabour] 
      })
      setShowGenderForm(false)
    }
    setGenderFormData({ gender: '', manpower: 0 })
  }

  const handleEditGender = (genderLabour: GenderLabour) => {
    setGenderFormData({
      gender: genderLabour.gender,
      manpower: genderLabour.manpower
    })
    setEditingGenderId(genderLabour.id)
    setShowGenderForm(true)
  }

  const handleDeleteGender = (id: string) => {
    const updatedGenderLabours = labours.genderLabours.filter(g => g.id !== id)
    onUpdateLabours({ ...labours, genderLabours: updatedGenderLabours })
  }

  const handleCancelGender = () => {
    setShowGenderForm(false)
    setEditingGenderId(null)
    setGenderFormData({ gender: '', manpower: 0 })
  }

  // Skilled Worker Handlers
  const handleSkilledSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingSkilledId) {
      const updatedSkilledWorkers = labours.skilledWorkers.map(s => 
        s.id === editingSkilledId ? { ...s, ...skilledFormData } : s
      )
      onUpdateLabours({ ...labours, skilledWorkers: updatedSkilledWorkers })
      setEditingSkilledId(null)
    } else {
      const newSkilledWorker = { ...skilledFormData, id: generateId() }
      onUpdateLabours({ 
        ...labours, 
        skilledWorkers: [...labours.skilledWorkers, newSkilledWorker] 
      })
      setShowSkilledForm(false)
    }
    setSkilledFormData({ skilled_worker: '', skilled_manpower: 0, working_description: '' })
  }

  const handleEditSkilled = (skilledWorker: SkilledWorker) => {
    setSkilledFormData({
      skilled_worker: skilledWorker.skilled_worker,
      skilled_manpower: skilledWorker.skilled_manpower,
      working_description: skilledWorker.working_description || ''
    })
    setEditingSkilledId(skilledWorker.id)
    setShowSkilledForm(true)
  }

  const handleDeleteSkilled = (id: string) => {
    const updatedSkilledWorkers = labours.skilledWorkers.filter(s => s.id !== id)
    onUpdateLabours({ ...labours, skilledWorkers: updatedSkilledWorkers })
  }

  const handleCancelSkilled = () => {
    setShowSkilledForm(false)
    setEditingSkilledId(null)
    setSkilledFormData({ skilled_worker: '', skilled_manpower: 0, working_description: '' })
  }

  const totalCount = labours.genderLabours.length + labours.skilledWorkers.length

  return (
    <AccordionCard title="Department Labours" badge={totalCount}>
      <div className="space-y-8">
        {/* Gender-based Workers Section */}
        <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Gender-based Workers
          </h4>
          
          <div className="space-y-3 mb-4">
            {labours.genderLabours.map((genderLabour) => (
              <div key={genderLabour.id} className="bg-white rounded-lg p-3 border border-emerald-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="bg-emerald-100 text-emerald-800 text-sm px-3 py-1 rounded-full font-medium">
                      {genderLabour.gender}
                    </span>
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm text-gray-600">{genderLabour.manpower} workers</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditGender(genderLabour)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteGender(genderLabour.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(showGenderForm || editingGenderId) && (
            <form onSubmit={handleGenderSubmit} className="bg-white rounded-lg p-4 border border-emerald-300 mb-4">
              <h5 className="font-medium text-gray-800 mb-3">
                {editingGenderId ? 'Edit Gender Worker' : 'Add Gender Worker'}
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={genderFormData.gender}
                    onChange={(e) => setGenderFormData({ ...genderFormData, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent relative z-50"
                    required
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manpower Count</label>
                  <input
                    type="number"
                   value={genderFormData.manpower || ''}
                   onChange={(e) => setGenderFormData({ ...genderFormData, manpower: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                   placeholder="Enter number of workers"
                    min="0"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingGenderId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelGender}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showGenderForm && !editingGenderId && (
            <button
              onClick={() => setShowGenderForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Gender Worker
            </button>
          )}
        </div>

        {/* Skilled Workers Section */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <HardHat className="w-5 h-5 text-blue-600" />
            Skilled Workers
          </h4>
          
          <div className="space-y-3 mb-4">
            {labours.skilledWorkers.map((skilledWorker) => (
              <div key={skilledWorker.id} className="bg-white rounded-lg p-3 border border-blue-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
                        {skilledWorker.skilled_worker}
                      </span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-gray-600">{skilledWorker.skilled_manpower} workers</span>
                      </div>
                    </div>
                    {skilledWorker.working_description && (
                      <p className="text-sm text-gray-600">{skilledWorker.working_description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditSkilled(skilledWorker)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSkilled(skilledWorker.id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {(showSkilledForm || editingSkilledId) && (
            <form onSubmit={handleSkilledSubmit} className="bg-white rounded-lg p-4 border border-blue-300 mb-4">
              <h5 className="font-medium text-gray-800 mb-3">
                {editingSkilledId ? 'Edit Skilled Worker' : 'Add Skilled Worker'}
              </h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skilled Worker Type</label>
                  <select
                    value={skilledFormData.skilled_worker}
                    onChange={(e) => setSkilledFormData({ ...skilledFormData, skilled_worker: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent relative z-50"
                    required
                  >
                    <option value="">Select Skilled Worker</option>
                    {skilledWorkerTypes.map(worker => (
                      <option key={worker} value={worker}>{worker}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Skilled Manpower</label>
                  <input
                    type="number"
                   value={skilledFormData.skilled_manpower || ''}
                   onChange={(e) => setSkilledFormData({ ...skilledFormData, skilled_manpower: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   placeholder="Enter number of skilled workers"
                    min="0"
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Working Description (Optional)</label>
                  <textarea
                    value={skilledFormData.working_description}
                    onChange={(e) => setSkilledFormData({ ...skilledFormData, working_description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={2}
                    placeholder="Describe the work being performed..."
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  type="submit"
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {editingSkilledId ? 'Update' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelSkilled}
                  className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!showSkilledForm && !editingSkilledId && (
            <button
              onClick={() => setShowSkilledForm(true)}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Skilled Worker
            </button>
          )}
        </div>
      </div>
    </AccordionCard>
  )
}