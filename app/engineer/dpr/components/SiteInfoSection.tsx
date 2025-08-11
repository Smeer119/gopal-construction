import React, { useState } from 'react'
import { AccordionCard } from './AccordionCard'
import { FileText, Calendar, Cloud, Thermometer, Edit3, Save, X } from 'lucide-react'

interface SiteInfo {
  siteName: string
  date: string
  weather: string
  temperature: string
}

interface SiteInfoSectionProps extends SiteInfo {
  onUpdate: (updates: Partial<SiteInfo>) => void
}

export const SiteInfoSection: React.FC<SiteInfoSectionProps> = ({ siteName, date, weather, temperature, onUpdate }) => {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<SiteInfo>({ siteName, date, weather, temperature })

  const startEdit = () => {
    setForm({ siteName, date, weather, temperature })
    setEditing(true)
  }

  const cancelEdit = () => {
    setEditing(false)
  }

  const save = () => {
    onUpdate(form)
    setEditing(false)
  }

  return (
    <AccordionCard title="Site Information" defaultOpen>
      {!editing ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <FileText className="w-3 h-3 inline mr-1" />
              Site Name
            </label>
            <div className="text-gray-800 font-medium">{siteName || '-'}
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Date
            </label>
            <div className="text-gray-800 font-medium">{date || '-'}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Cloud className="w-3 h-3 inline mr-1" />
              Weather
            </label>
            <div className="text-gray-800 font-medium">{weather || '-'}</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              <Thermometer className="w-3 h-3 inline mr-1" />
              Temperature
            </label>
            <div className="text-gray-800 font-medium">{temperature || '-'}</div>
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            <button onClick={startEdit} className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              <Edit3 className="w-4 h-4" />
              Edit Site Info
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-gray-800 mb-4 flex items-center gap-2">
            <Edit3 className="w-4 h-4 text-blue-600" />
            Edit Site Info
          </h4>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => setForm({ ...form, siteName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter site name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weather</label>
              <select
                value={form.weather}
                onChange={(e) => setForm({ ...form, weather: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Sunny">Sunny</option>
                <option value="Cloudy">Cloudy</option>
                <option value="Rainy">Rainy</option>
                <option value="Stormy">Stormy</option>
                <option value="Windy">Windy</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Temperature</label>
              <input
                type="text"
                value={form.temperature}
                onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 25°C"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={save} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              <Save className="w-4 h-4" />
              Save
            </button>
            <button onClick={cancelEdit} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      )}
    </AccordionCard>
  )
}
