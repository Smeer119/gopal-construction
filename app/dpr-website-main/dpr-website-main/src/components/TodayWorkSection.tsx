import React, { useState } from 'react'
import { Plus, Briefcase, Users, Hash, Camera, Edit3, Trash2, Save, X } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface TodayWork {
  id: string
  work_categories: string[]
  quantity: number
  manpower: number
  working_description: string
  images: string[]
}

interface TodayWorkSectionProps {
  todayWork: TodayWork[]
  onAddTodayWork: (work: Omit<TodayWork, 'id'>) => void
  onUpdateTodayWork: (id: string, work: Partial<TodayWork>) => void
  onDeleteTodayWork: (id: string) => void
}

const workCategories = [
  'Earthwork', 'Concrete', 'BBS', 'Tiling', 'Interior', 'Electrical',
  'Plumbing', 'Painting', 'Masonry', 'Steel Work', 'Carpentry', 'Roofing'
]

export const TodayWorkSection: React.FC<TodayWorkSectionProps> = ({
  todayWork,
  onAddTodayWork,
  onUpdateTodayWork,
  onDeleteTodayWork
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    work_categories: [] as string[],
    quantity: '',
    manpower: '',
    working_description: '',
    images: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const submitData = {
      work_categories: formData.work_categories,
      quantity: parseInt(formData.quantity) || 0,
      manpower: parseInt(formData.manpower) || 0,
      working_description: formData.working_description,
      images: formData.images
    }

    if (editingId) {
      onUpdateTodayWork(editingId, submitData)
      setEditingId(null)
    } else {
      onAddTodayWork(submitData)
      setShowAddForm(false)
    }
    setFormData({ work_categories: [], quantity: '', manpower: '', working_description: '', images: [] })
  }

  const handleEdit = (work: TodayWork) => {
    setFormData({
      work_categories: work.work_categories,
      quantity: work.quantity.toString(),
      manpower: work.manpower.toString(),
      working_description: work.working_description,
      images: work.images
    })
    setEditingId(work.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ work_categories: [], quantity: '', manpower: '', working_description: '', images: [] })
  }

  const toggleWorkCategory = (category: string) => {
    setFormData(prev => ({
      ...prev,
      work_categories: prev.work_categories.includes(category)
        ? prev.work_categories.filter(c => c !== category)
        : [...prev.work_categories, category]
    }))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, event.target?.result as string]
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  return (
    <AccordionCard title="Today's Work" badge={todayWork.length}>
      <div className="space-y-4">
        {todayWork.map((work) => (
          <div key={work.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <h4 className="font-medium text-gray-800">Work Categories</h4>
                </div>
                <div className="flex flex-wrap gap-1 mb-3">
                  {work.work_categories.map((category, index) => (
                    <span key={index} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                      {category}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div className="flex items-center gap-1">
                    <Hash className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-600">Quantity: {work.quantity}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm text-gray-600">Manpower: {work.manpower}</span>
                  </div>
                </div>
                {work.working_description && (
                  <p className="text-sm text-gray-600 mb-2">{work.working_description}</p>
                )}
                {work.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {work.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Work ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(work)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteTodayWork(work.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(showAddForm || editingId) && (
          <form onSubmit={handleSubmit} className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              {editingId ? 'Edit Today\'s Work' : 'Add Today\'s Work'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Work Categories</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {workCategories.map((category) => (
                    <label key={category} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.work_categories.includes(category)}
                        onChange={() => toggleWorkCategory(category)}
                        className="w-4 h-4 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="text-sm text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter quantity"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Manpower</label>
                  <input
                    type="number"
                    value={formData.manpower}
                    onChange={(e) => setFormData({ ...formData, manpower: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Enter manpower count"
                    min="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Working Description (Optional)</label>
                <textarea
                  value={formData.working_description}
                  onChange={(e) => setFormData({ ...formData, working_description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the work performed (optional)..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Images (Optional)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="work-images"
                  />
                  <label
                    htmlFor="work-images"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Upload Images
                  </label>
                </div>
                {formData.images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.images.map((image, index) => (
                      <div key={index} className="relative">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm cursor-pointer"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Work
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
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Today's Work
          </button>
        )}
      </div>
    </AccordionCard>
  )
}
