import React, { useState } from 'react'
import { Plus, AlertTriangle, Camera, Edit3, Trash2, Save, X } from 'lucide-react'
import { AccordionCard } from './AccordionCard'

export interface CriticalIssue {
  id: string
  description: string
  photo_url: string | null
}

interface CriticalIssuesSectionProps {
  issues: CriticalIssue[]
  onAddIssue: (issue: Omit<CriticalIssue, 'id'>) => void
  onUpdateIssue: (id: string, issue: Partial<CriticalIssue>) => void
  onDeleteIssue: (id: string) => void
}

export const CriticalIssuesSection: React.FC<CriticalIssuesSectionProps> = ({
  issues,
  onAddIssue,
  onUpdateIssue,
  onDeleteIssue
}) => {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    description: '',
    photo_url: null as string | null
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      onUpdateIssue(editingId, formData)
      setEditingId(null)
    } else {
      onAddIssue(formData)
      setShowAddForm(false)
    }
    setFormData({ description: '', photo_url: null })
  }

  const handleEdit = (issue: CriticalIssue) => {
    setFormData({
      description: issue.description,
      photo_url: issue.photo_url
    })
    setEditingId(issue.id)
    setShowAddForm(true)
  }

  const handleCancel = () => {
    setShowAddForm(false)
    setEditingId(null)
    setFormData({ description: '', photo_url: null })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real application, you would upload to Supabase storage
      // For now, we'll just create a placeholder URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setFormData({ ...formData, photo_url: event.target?.result as string })
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <AccordionCard title="Critical Site Issues" badge={issues.length}>
      <div className="space-y-4">
        {issues.map((issue) => (
          <div key={issue.id} className="bg-red-50 rounded-lg p-4 border border-red-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-medium text-gray-800">Critical Issue</h4>
                </div>
                <p className="text-sm text-gray-700 mb-2">{issue.description}</p>
                {issue.photo_url && (
                  <div className="mt-2">
                    <img 
                      src={issue.photo_url} 
                      alt="Issue photo"
                      className="w-40 h-40 object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => window.open(issue.photo_url!, '_blank')}
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => handleEdit(issue)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteIssue(issue.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {(showAddForm || editingId) && (
          <form onSubmit={handleSubmit} className="bg-red-50 rounded-lg p-4 border border-red-200">
            <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              {editingId ? 'Edit Critical Issue' : 'Add Critical Issue'}
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe the critical issue..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo (Optional)</label>
                <div className="flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    Upload Photo
                  </label>
                  {formData.photo_url && (
                    <img 
                      src={formData.photo_url} 
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-lg border border-gray-300 shadow-sm"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingId ? 'Update' : 'Add'} Issue
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
            className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Critical Issue
          </button>
        )}
      </div>
    </AccordionCard>
  )
}