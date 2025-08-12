"use client"

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
// ✅ DO THIS at the top of page.tsx
import { MaterialRequirementSection, MaterialRequirement } from './components/MaterialRequirement'
import { SiteInfoSection } from './components/SiteInfoSection'


function App() {
  const [showPreview, setShowPreview] = useState(false)
  // Note: DPR form data persists only in localStorage. PDFs are uploaded to Supabase in PDFGenerator.
  
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
  // material requirement handlers
  const [requirements, setRequirements] = useState<MaterialRequirement[]>([])

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
      setRequirements(parsed.materialRequirements || [])
    }
  }, [])

  const saveData = async () => {
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
      materialTests,
      materialRequirements: requirements
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
  }, [siteName, date, weather, temperature, contractors, labours, equipment, visitors, issues, todayWork, tomorrowWork, expensesData, materialTests, requirements])

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

  const addRequirement = (requirement: Omit<MaterialRequirement, 'id'>) => {
    const newRequirement = {
      id: Date.now().toString(), // or use uuid
      ...requirement,
    }
    setRequirements((prev) => [...prev, newRequirement])
  }

  const updateRequirement = (id: string, updated: Partial<MaterialRequirement>) => {
    setRequirements((prev) =>
      prev.map((req) => (req.id === id ? { ...req, ...updated } : req))
    )
  }

  const deleteRequirement = (id: string) => {
    setRequirements((prev) => prev.filter((req) => req.id !== id))
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
    materialTests,
    materialRequirements: requirements
  };

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
                <Link href="/dashboard/engineer">
                  <Button variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              <SiteInfoSection
                siteName={siteName}
                date={date}
                weather={weather}
                temperature={temperature}
                onUpdate={(u) => {
                  if (u.siteName !== undefined) setSiteName(u.siteName)
                  if (u.date !== undefined) setDate(u.date)
                  if (u.weather !== undefined) setWeather(u.weather)
                  if (u.temperature !== undefined) setTemperature(u.temperature)
                }}
              />
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
              <TodayWorkSection
                todayWork={todayWork}
                onAddTodayWork={addTodayWork}
                onUpdateTodayWork={updateTodayWork}
                onDeleteTodayWork={deleteTodayWork}
              />

              <EquipmentSection
                equipment={equipment}
                onAddEquipment={addEquipment}
                onUpdateEquipment={updateEquipment}
                onDeleteEquipment={deleteEquipment}
              />
              <TomorrowWorkSection
                tomorrowWork={tomorrowWork}
                onAddTomorrowWork={addTomorrowWork}
                onUpdateTomorrowWork={updateTomorrowWork}
                onDeleteTomorrowWork={deleteTomorrowWork}
              />
           
           <MaterialRequirementSection
  requirements={requirements}
  onAddRequirement={addRequirement}
  onUpdateRequirement={updateRequirement}
  onDeleteRequirement={deleteRequirement}
/>


                <MaterialTestingSection
                materialTests={materialTests}
                onAddMaterialTest={addMaterialTest}
                onUpdateMaterialTest={updateMaterialTest}
                onDeleteMaterialTest={deleteMaterialTest}
              /> 


              <CriticalIssuesSection
                issues={issues}
                onAddIssue={addIssue}
                onUpdateIssue={updateIssue}
                onDeleteIssue={deleteIssue}
              />
              <VisitorSection
                visitors={visitors}
                onAddVisitor={addVisitor}
                onUpdateVisitor={updateVisitor}
                onDeleteVisitor={deleteVisitor}
              />

              <ExpensesSection
                expensesData={expensesData}
                onUpdateExpenses={updateExpensesData}
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
              <p>DPR Management System - buildkaam</p>
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