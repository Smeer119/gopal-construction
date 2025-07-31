import React, { useState, useEffect } from 'react'
import { FileText, Calendar, Cloud, Thermometer, Save, Construction, Eye, RotateCcw } from 'lucide-react'
import { ContractorSection, type Contractor } from './components/ContractorSection'
import { DepartmentLabourSection, type DepartmentLabour, type GenderLabour, type SkilledWorker } from './components/DepartmentLabourSection'
import { EquipmentSection, type Equipment } from './components/EquipmentSection'
import { VisitorSection, type Visitor } from './components/VisitorSection'
import { CriticalIssuesSection, type CriticalIssue } from './components/CriticalIssuesSection'
import { TodayWorkSection, type TodayWork } from './components/TodayWorkSection'
import { TomorrowWorkSection, type TomorrowWork } from './components/TomorrowWorkSection'
import { ExpensesSection, type ExpensesData, type PettyCash, type Expense } from './components/ExpensesSection'
import { MaterialTestingSection, type MaterialTest } from './components/MaterialTestingSection'
import { PDFGenerator } from './components/PDFGenerator'

function App() {
  const [showPreview, setShowPreview] = useState(false)
  
  // Basic report information
  const [siteName, setSiteName] = useState('Construction Site Alpha')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [weather, setWeather] = useState('Sunny')
  const [temperature, setTemperature] = useState('25°C')

  // Data arrays for each section
  const [contractors, setContractors] = useState<Contractor[]>([])
  const [labours, setLabours] = useState<DepartmentLabour>({ genderLabours: [], skilledWorkers: [] })
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [visitors, setVisitors] = useState<Visitor[]>([])
  const [issues, setIssues] = useState<CriticalIssue[]>([])
  const [todayWork, setTodayWork] = useState<TodayWork[]>([])
  const [tomorrowWork, setTomorrowWork] = useState<TomorrowWork[]>([])
  const [expensesData, setExpensesData] = useState<ExpensesData>({ pettyCash: [], expenses: [] })
  const [materialTests, setMaterialTests] = useState<MaterialTest[]>([])

  // Save to localStorage for persistence
  useEffect(() => {
    const savedData = localStorage.getItem('dpr-data')
    if (savedData) {
      const parsed = JSON.parse(savedData)
      setSiteName(parsed.siteName || 'Construction Site Alpha')
      setDate(parsed.date || new Date().toISOString().split('T')[0])
      setWeather(parsed.weather || 'Sunny')
      setTemperature(parsed.temperature || '25°C')
      setContractors(parsed.contractors || [])
      setLabours({
        genderLabours: parsed.labours?.genderLabours || [],
        skilledWorkers: parsed.labours?.skilledWorkers || []
      })
      setEquipment(parsed.equipment || [])
      setVisitors(parsed.visitors || [])
      setIssues(parsed.issues || [])
      setTodayWork(parsed.todayWork || [])
      setTomorrowWork(parsed.tomorrowWork || [])
      setExpensesData({
        pettyCash: parsed.expensesData?.pettyCash || [],
        expenses: parsed.expensesData?.expenses || []
      })
      setMaterialTests(parsed.materialTests || [])
    }
  }, [])

  const saveData = () => {
    const data = {
      siteName,
      date,
      weather,
      temperature,
      contractors,
      labours,
      equipment,
      visitors,
      issues,
      todayWork,
      tomorrowWork,
      expensesData,
      materialTests
    }
    localStorage.setItem('dpr-data', JSON.stringify(data))
    
    // Visual feedback
    const button = document.getElementById('save-button')
    if (button) {
      button.textContent = 'Saved!'
      setTimeout(() => {
        button.textContent = 'Save Progress'
      }, 2000)
    }
  }

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveData, 30000)
    return () => clearInterval(interval)
  }, [siteName, date, weather, temperature, contractors, labours, equipment, visitors, issues, todayWork, tomorrowWork, expensesData, materialTests])

  // Helper function to generate unique IDs
  const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9)

  // Contractor handlers
  const addContractor = (contractor: Omit<Contractor, 'id'>) => {
    setContractors([...contractors, { ...contractor, id: generateId() }])
  }

  const updateContractor = (id: string, updates: Partial<Contractor>) => {
    setContractors(contractors.map(c => c.id === id ? { ...c, ...updates } : c))
  }

  const deleteContractor = (id: string) => {
    setContractors(contractors.filter(c => c.id !== id))
  }

  // Labour handlers
  const updateLabours = (newLabours: DepartmentLabour) => {
    setLabours(newLabours)
  }

  // Equipment handlers
  const addEquipment = (eq: Omit<Equipment, 'id'>) => {
    setEquipment([...equipment, { ...eq, id: generateId() }])
  }

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipment(equipment.map(e => e.id === id ? { ...e, ...updates } : e))
  }

  const deleteEquipment = (id: string) => {
    setEquipment(equipment.filter(e => e.id !== id))
  }

  // Visitor handlers
  const addVisitor = (visitor: Omit<Visitor, 'id'>) => {
    setVisitors([...visitors, { ...visitor, id: generateId() }])
  }

  const updateVisitor = (id: string, updates: Partial<Visitor>) => {
    setVisitors(visitors.map(v => v.id === id ? { ...v, ...updates } : v))
  }

  const deleteVisitor = (id: string) => {
    setVisitors(visitors.filter(v => v.id !== id))
  }

  // Issue handlers
  const addIssue = (issue: Omit<CriticalIssue, 'id'>) => {
    setIssues([...issues, { ...issue, id: generateId() }])
  }

  const updateIssue = (id: string, updates: Partial<CriticalIssue>) => {
    setIssues(issues.map(i => i.id === id ? { ...i, ...updates } : i))
  }

  const deleteIssue = (id: string) => {
    setIssues(issues.filter(i => i.id !== id))
  }

  // Today Work handlers
  const addTodayWork = (work: Omit<TodayWork, 'id'>) => {
    setTodayWork([...todayWork, { ...work, id: generateId() }])
  }

  const updateTodayWork = (id: string, updates: Partial<TodayWork>) => {
    setTodayWork(todayWork.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const deleteTodayWork = (id: string) => {
    setTodayWork(todayWork.filter(w => w.id !== id))
  }

  // Tomorrow Work handlers
  const addTomorrowWork = (work: Omit<TomorrowWork, 'id'>) => {
    setTomorrowWork([...tomorrowWork, { ...work, id: generateId() }])
  }

  const updateTomorrowWork = (id: string, updates: Partial<TomorrowWork>) => {
    setTomorrowWork(tomorrowWork.map(w => w.id === id ? { ...w, ...updates } : w))
  }

  const deleteTomorrowWork = (id: string) => {
    setTomorrowWork(tomorrowWork.filter(w => w.id !== id))
  }

  // Expenses handlers
  const updateExpensesData = (newExpensesData: ExpensesData) => {
    setExpensesData(newExpensesData)
  }

  // Material Test handlers
  const addMaterialTest = (test: Omit<MaterialTest, 'id'>) => {
    setMaterialTests([...materialTests, { ...test, id: generateId() }])
  }

  const updateMaterialTest = (id: string, updates: Partial<MaterialTest>) => {
    setMaterialTests(materialTests.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteMaterialTest = (id: string) => {
    setMaterialTests(materialTests.filter(t => t.id !== id))
  }

  const reportData = {
    siteName,
    date,
    weather,
    temperature,
    contractors,
    labours,
    equipment,
    visitors,
    issues,
    todayWork,
    tomorrowWork,
    expensesData,
    materialTests
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl min-h-screen">
        {!showPreview ? (
          <>
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 w-full">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Construction className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Daily Progress Report</h1>
              <p className="text-gray-600">Construction Site Management System</p>
            </div>
          </div>

          {/* Basic Information Form */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <FileText className="w-4 h-4 inline mr-1" />
                Site Name
              </label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter site name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Cloud className="w-4 h-4 inline mr-1" />
                Weather
              </label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Thermometer className="w-4 h-4 inline mr-1" />
                Temperature
              </label>
              <input
                type="text"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 25°C"
              />
            </div>
          </div>

        </div>

        {/* Main Content Sections */}
        <div className="space-y-6 w-full">
          <ContractorSection
            contractors={contractors}
            onAddContractor={addContractor}
            onUpdateContractor={updateContractor}
            onDeleteContractor={deleteContractor}
          />

          <DepartmentLabourSection
            labours={labours}
            onUpdateLabours={updateLabours}
          />

          <EquipmentSection
            equipment={equipment}
            onAddEquipment={addEquipment}
            onUpdateEquipment={updateEquipment}
            onDeleteEquipment={deleteEquipment}
          />

          <VisitorSection
            visitors={visitors}
            onAddVisitor={addVisitor}
            onUpdateVisitor={updateVisitor}
            onDeleteVisitor={deleteVisitor}
          />

          <CriticalIssuesSection
            issues={issues}
            onAddIssue={addIssue}
            onUpdateIssue={updateIssue}
            onDeleteIssue={deleteIssue}
          />

          <TodayWorkSection
            todayWork={todayWork}
            onAddTodayWork={addTodayWork}
            onUpdateTodayWork={updateTodayWork}
            onDeleteTodayWork={deleteTodayWork}
          />

          <TomorrowWorkSection
            tomorrowWork={tomorrowWork}
            onAddTomorrowWork={addTomorrowWork}
            onUpdateTomorrowWork={updateTomorrowWork}
            onDeleteTomorrowWork={deleteTomorrowWork}
          />

          <ExpensesSection
            expensesData={expensesData}
            onUpdateExpenses={updateExpensesData}
          />

          <MaterialTestingSection
            materialTests={materialTests}
            onAddMaterialTest={addMaterialTest}
            onUpdateMaterialTest={updateMaterialTest}
            onDeleteMaterialTest={deleteMaterialTest}
          />
        </div>

        {/* Action Buttons at Bottom */}
        <div className="mt-12 bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Report Actions</h3>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              id="save-button"
              onClick={saveData}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Save className="w-5 h-5" />
              Save Progress
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              <Eye className="w-5 h-5" />
              Preview Report
            </button>
          </div>
        </div>
        {/* Footer */}
        <div className="mt-12 text-center text-gray-500 text-sm pb-8">
          <p>DPR Management System - Built for Construction Excellence</p>
        </div>
          </>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 w-full min-h-screen">
            <PDFGenerator 
              reportData={reportData} 
              onEdit={() => setShowPreview(false)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default App