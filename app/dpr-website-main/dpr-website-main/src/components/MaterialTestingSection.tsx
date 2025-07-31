import React, { useState } from 'react'
import { Plus, TestTube, Camera, Edit3, Trash2, Save, X } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface MaterialTest {
  id: string
  test_type: string
  description: string
  test_images: string[]
}

interface MaterialTestingSectionProps {
  materialTests: MaterialTest[]
  onAddMaterialTest: (test: Omit<MaterialTest, 'id'>) => void
  onUpdateMaterialTest: (id: string, test: Partial<MaterialTest>) => void
  onDeleteMaterialTest: (id: string) => void
}

const testTypes = [
  'Cube Test', 'Steel Test', 'Slump Test', 'Compaction Test', 
  'Concrete Test', 'Soil Test', 'Water Test', 'Aggregate Test'
]

export const MaterialTestingSection: React.FC<MaterialTestingSectionProps> = ({
  materialTests,
  onAddMaterialTest,
  onUpdateMaterialTest,
  onDeleteMaterialTest
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    test_type: '',
    description: '',
    test_images: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      onUpdateMaterialTest(editingId, formData)
      setEditingId(null)
    } else {
      onAddMaterialTest(formData)
      setShowAddForm(false)
    }
    setFormData({ test_type: '', description: '', test_images: [] })
  }

  const handleEdit = (test: MaterialTest) => {
    setFormData({
      test_type: test.test_type,
      description: test.description,
      test_images: test.test_images
    })
    setEditingId(test.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ test_type: '', description: '', test_images: [] })
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader()
        reader.onload = (event) => {
          setFormData(prev => ({
            ...prev,
            test_images: [...prev.test_images, event.target?.result as string]
          }))
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      test_images: prev.test_images.filter((_, i) => i !== index)
    }))
  }

  return (
    <AccordionCard title="Material Testing" badge={materialTests.length}>
      <div className="space-y-4">
        {materialTests.map((test) => (
          <div key={test.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <TestTube className="w-4 h-4 text-cyan-600" />
                  <h4 className="font-medium text-gray-800">{test.test_type}</h4>
                </div>
                <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                {test.test_images.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {test.test_images.map((image, index) => (
                      <img 
                        key={index}
                        src={image} 
                        alt={`Test ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                      />
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(test)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteMaterialTest(test.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(showAddForm || editingId) && (
          <form onSubmit={handleSubmit} className="bg-cyan-50 rounded-lg p-4 border border-cyan-200">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <TestTube className="w-4 h-4 text-cyan-600" />
              {editingId ? 'Edit Material Test' : 'Add Material Test'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Type</label>
                <select
                  value={formData.test_type}
                  onChange={(e) => setFormData({ ...formData, test_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent relative z-50"
                  required
                >
                  <option value="">Select test type</option>
                  {testTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the test performed, results, observations..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Images (Optional)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    id="test-images"
                  />
                  <label
                    htmlFor="test-images"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Upload Test Images
                  </label>
                </div>
                {formData.test_images.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2">
                    {formData.test_images.map((image, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={image} 
                          alt={`Preview ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-300 shadow-sm"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 shadow-sm"
                        >
                          ×
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
                className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Test
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
            className="w-full flex items-center justify-center gap-2 bg-cyan-600 text-white py-3 px-4 rounded-lg hover:bg-cyan-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Material Test
          </button>
        )}
      </div>
    </AccordionCard>
  )
}