import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { Users, HardHat, Truck, AlertTriangle, Eye, Edit, FileDown, DollarSign, TestTube, Calendar, Briefcase } from 'lucide-react'
import type { Contractor } from './ContractorSection'
import type { DepartmentLabour, GenderLabour, SkilledWorker } from './DepartmentLabourSection'
import type { Equipment } from './EquipmentSection'
import type { Visitor } from './VisitorSection'
import type { CriticalIssue } from './CriticalIssuesSection'
import type { TodayWork } from './TodayWorkSection'
import type { TomorrowWork } from './TomorrowWorkSection'
import type { ExpensesData } from './ExpensesSection'
import type { MaterialTest } from './MaterialTestingSection'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'

interface ReportPreviewProps {
  reportData: {
    siteName: string
    date: string
    weather: string
    temperature: string
    contractors: Contractor[]
    labours: DepartmentLabour
    equipment: Equipment[]
    visitors: Visitor[]
    issues: CriticalIssue[]
    todayWork: TodayWork[]
    tomorrowWork: TomorrowWork[]
    expensesData: ExpensesData
    materialTests: MaterialTest[]
  }
  onClose: () => void
  onEdit: () => void
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16']

export const ReportPreview: React.FC<ReportPreviewProps> = ({ reportData, onClose, onEdit }) => {
  // Calculate totals
  const totalGenderManpower = reportData.labours.genderLabours.reduce((sum, l) => sum + l.manpower, 0)
  const totalSkilledManpower = reportData.labours.skilledWorkers.reduce((sum, l) => sum + l.skilled_manpower, 0)
  const totalContractorManpower = reportData.contractors.reduce((sum, c) => sum + c.manpower, 0)
  const totalManpower = totalContractorManpower + totalGenderManpower + totalSkilledManpower
  const totalReceived = reportData.expensesData.pettyCash.reduce((sum, pc) => sum + pc.amount, 0)
  const totalExpenses = reportData.expensesData.expenses.reduce((sum, exp) => sum + exp.amount, 0)
  const balance = totalReceived - totalExpenses

  // Prepare chart data
  const manpowerData = [
    { name: 'Contractors', count: totalContractorManpower, fill: '#3B82F6' },
    { name: 'Gender Labour', count: totalGenderManpower, fill: '#10B981' },
    { name: 'Skilled Workers', count: totalSkilledManpower, fill: '#F59E0B' }
  ].filter(item => item.count > 0)

  const genderData = reportData.labours.genderLabours.reduce((acc, labour) => {
    const existing = acc.find(item => item.name === labour.gender)
    if (existing) {
      existing.value += labour.manpower
    } else {
      acc.push({ name: labour.gender, value: labour.manpower })
    }
    return acc
  }, [] as { name: string; value: number }[])

  const skillData = reportData.labours.skilledWorkers.reduce((acc, labour) => {
    const existing = acc.find(item => item.name === labour.skilled_worker)
    if (existing) {
      existing.value += labour.skilled_manpower
    } else {
      acc.push({ name: labour.skilled_worker, value: labour.skilled_manpower })
    }
    return acc
  }, [] as { name: string; value: number }[])

  const workCategoryData = reportData.todayWork.reduce((acc, work) => {
    work.work_categories.forEach(category => {
      const existing = acc.find(item => item.name === category)
      if (existing) {
        existing.quantity += work.quantity
        existing.manpower += work.manpower
      } else {
        acc.push({ name: category, quantity: work.quantity, manpower: work.manpower })
      }
    })
    return acc
  }, [] as { name: string; quantity: number; manpower: number }[])

  const expenseData = [
    { name: 'Received', amount: totalReceived, fill: '#10B981' },
    { name: 'Expenses', amount: totalExpenses, fill: '#EF4444' }
  ].filter(item => item.amount > 0)

  const downloadPreviewAsPDF = async () => {
    const element = document.getElementById('preview-content')
    if (!element) return

    try {
      // Create canvas from the preview content
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = pdfWidth - 20 // 10mm margin on each side
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 10 // 10mm top margin

      // Add first page
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight - 20 // Account for margins

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight - 20
      }

      const fileName = `DPR_Preview_${reportData.siteName.replace(/\s+/g, '_')}_${reportData.date}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-7xl w-full my-4 min-h-fit">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Eye className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-800">Report Preview</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={downloadPreviewAsPDF}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileDown className="w-4 h-4" />
              Download Preview
            </button>
            <button
              onClick={onEdit}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit Report
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold px-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div id="preview-content" className="p-8 space-y-8 bg-white w-full overflow-x-auto">
          {/* Report Header */}
          <div className="text-center border-b border-gray-200 pb-6">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Daily Progress Report (DPR)</h1>
            <p className="text-lg text-gray-600">{reportData.siteName}</p>
            <p className="text-gray-500">{reportData.date}</p>
          </div>

          {/* Site Information */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Site Information</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="text-center">
                <span className="text-sm font-medium text-gray-600">Site Name</span>
                <p className="font-semibold text-gray-800">{reportData.siteName}</p>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-600">Date</span>
                <p className="font-semibold text-gray-800">{reportData.date}</p>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-600">Weather</span>
                <p className="font-semibold text-gray-800">{reportData.weather}</p>
              </div>
              <div className="text-center">
                <span className="text-sm font-medium text-gray-600">Temperature</span>
                <p className="font-semibold text-gray-800">{reportData.temperature}</p>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-blue-600">Total Contractors</p>
              <p className="text-2xl font-bold text-blue-800">{reportData.contractors.length}</p>
            </div>
            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 text-center">
              <HardHat className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-emerald-600">Total Manpower</p>
              <p className="text-2xl font-bold text-emerald-800">{totalManpower}</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 border border-orange-200 text-center">
              <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-orange-600">Equipment</p>
              <p className="text-2xl font-bold text-orange-800">{reportData.equipment.length}</p>
            </div>
            <div className="bg-red-50 rounded-lg p-4 border border-red-200 text-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-red-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-800">{reportData.issues.length}</p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Manpower Distribution Chart */}
            {manpowerData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Manpower Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={manpowerData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gender Distribution */}
            {genderData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Gender Distribution</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Work Categories Chart */}
            {workCategoryData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Today's Work Categories</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={workCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantity" fill="#6366F1" name="Quantity" />
                    <Bar dataKey="manpower" fill="#10B981" name="Manpower" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Financial Overview */}
            {expenseData.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Financial Overview</h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={expenseData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                    <Bar dataKey="amount" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Detailed Sections */}
          <div className="space-y-8">
            {/* Contractors */}
            {reportData.contractors.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Contractors ({reportData.contractors.length})
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {reportData.contractors.map((contractor, index) => (
                    <div key={contractor.id} className="bg-white rounded-lg p-4 border border-blue-200">
                      <h5 className="font-medium text-gray-800">{contractor.name}</h5>
                      <p className="text-sm text-blue-600">{contractor.role}</p>
                      <p className="text-sm text-gray-600">Manpower: {contractor.manpower}</p>
                      {contractor.working_description && (
                        <p className="text-sm text-gray-500 mt-1">{contractor.working_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Department Labours */}
            {(reportData.labours.genderLabours.length > 0 || reportData.labours.skilledWorkers.length > 0) && (
              <div className="bg-emerald-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <HardHat className="w-5 h-5 text-emerald-600" />
                  Department Labours
                </h4>
                
                {reportData.labours.genderLabours.length > 0 && (
                  <div className="mb-6">
                    <h5 className="font-medium text-gray-700 mb-3">Gender-based Workers</h5>
                    <div className="grid md:grid-cols-3 gap-3">
                      {reportData.labours.genderLabours.map((labour, index) => (
                        <div key={labour.id} className="bg-white rounded-lg p-3 border border-emerald-200">
                          <p className="font-medium text-gray-800">{labour.gender}</p>
                          <p className="text-sm text-gray-600">{labour.manpower} workers</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {reportData.labours.skilledWorkers.length > 0 && (
                  <div>
                    <h5 className="font-medium text-gray-700 mb-3">Skilled Workers</h5>
                    <div className="grid md:grid-cols-2 gap-4">
                      {reportData.labours.skilledWorkers.map((worker, index) => (
                        <div key={worker.id} className="bg-white rounded-lg p-4 border border-emerald-200">
                          <p className="font-medium text-gray-800">{worker.skilled_worker}</p>
                          <p className="text-sm text-gray-600">{worker.skilled_manpower} workers</p>
                          {worker.working_description && (
                            <p className="text-sm text-gray-500 mt-1">{worker.working_description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Equipment */}
            {reportData.equipment.length > 0 && (
              <div className="bg-orange-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-orange-600" />
                  Equipment & Machinery ({reportData.equipment.length})
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {reportData.equipment.map((eq, index) => (
                    <div key={eq.id} className="bg-white rounded-lg p-4 border border-orange-200">
                      <h5 className="font-medium text-gray-800">{eq.machine_type}</h5>
                      <p className="text-sm text-orange-600">{eq.from_time} - {eq.to_time}</p>
                      {eq.working_description && (
                        <p className="text-sm text-gray-500 mt-1">{eq.working_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Today's Work */}
            {reportData.todayWork.length > 0 && (
              <div className="bg-indigo-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                  Today's Work ({reportData.todayWork.length})
                </h4>
                <div className="space-y-4">
                  {reportData.todayWork.map((work, index) => (
                    <div key={work.id} className="bg-white rounded-lg p-4 border border-indigo-200">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {work.work_categories.map((category, idx) => (
                          <span key={idx} className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <p className="text-sm text-gray-600">Quantity: {work.quantity}</p>
                        <p className="text-sm text-gray-600">Manpower: {work.manpower}</p>
                      </div>
                      {work.working_description && (
                        <p className="text-sm text-gray-500 mb-2">{work.working_description}</p>
                      )}
                      {work.images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {work.images.map((image, idx) => (
                            <img 
                              key={idx}
                              src={image} 
                              alt={`Work ${idx + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => window.open(image, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tomorrow's Work */}
            {reportData.tomorrowWork.length > 0 && (
              <div className="bg-teal-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-teal-600" />
                  Tomorrow's Work ({reportData.tomorrowWork.length})
                </h4>
                <div className="space-y-4">
                  {reportData.tomorrowWork.map((work, index) => (
                    <div key={work.id} className="bg-white rounded-lg p-4 border border-teal-200">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {work.work_categories.map((category, idx) => (
                          <span key={idx} className="bg-teal-100 text-teal-800 text-xs px-2 py-1 rounded-full">
                            {category}
                          </span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mb-2">
                        <p className="text-sm text-gray-600">Quantity: {work.quantity}</p>
                        <p className="text-sm text-gray-600">Manpower: {work.manpower}</p>
                      </div>
                      {work.working_description && (
                        <p className="text-sm text-gray-500">{work.working_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Visitors */}
            {reportData.visitors.length > 0 && (
              <div className="bg-purple-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  Today's Visitors ({reportData.visitors.length})
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {reportData.visitors.map((visitor, index) => (
                    <div key={visitor.id} className="bg-white rounded-lg p-4 border border-purple-200">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {visitor.visitor_types.map((type, idx) => (
                          <span key={idx} className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                            {type}
                          </span>
                        ))}
                      </div>
                      {visitor.visit_description && (
                        <p className="text-sm text-gray-500">{visitor.visit_description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Critical Issues */}
            {reportData.issues.length > 0 && (
              <div className="bg-red-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  Critical Issues ({reportData.issues.length})
                </h4>
                <div className="space-y-4">
                  {reportData.issues.map((issue, index) => (
                    <div key={issue.id} className="bg-white rounded-lg p-4 border border-red-200">
                      <h5 className="font-medium text-gray-800 mb-2">Issue #{index + 1}</h5>
                      <p className="text-sm text-gray-600 mb-2">{issue.description}</p>
                      {issue.photo_url && (
                        <img 
                          src={issue.photo_url} 
                          alt="Issue"
                          className="w-40 h-40 object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => window.open(issue.photo_url!, '_blank')}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Expenses */}
            {(reportData.expensesData.pettyCash.length > 0 || reportData.expensesData.expenses.length > 0) && (
              <div className="bg-green-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Expenses / Petty Cash
                </h4>
                
                {/* Financial Summary */}
                <div className="bg-white rounded-lg p-4 border border-green-200 mb-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600">Total Received</p>
                      <p className="text-xl font-bold text-green-600">₹{totalReceived.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Expenses</p>
                      <p className="text-xl font-bold text-red-600">₹{totalExpenses.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Balance</p>
                      <p className={`text-xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{balance.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {reportData.expensesData.pettyCash.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">Received Cash</h5>
                      <div className="space-y-2">
                        {reportData.expensesData.pettyCash.map((cash, index) => (
                          <div key={cash.id} className="bg-white rounded-lg p-3 border border-green-200">
                            <p className="font-medium text-gray-800">{cash.details}</p>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">{cash.date}</span>
                              <span className="bg-green-100 text-green-800 text-sm px-2 py-1 rounded-full">
                                +₹{cash.amount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {reportData.expensesData.expenses.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-700 mb-3">Expenses</h5>
                      <div className="space-y-2">
                        {reportData.expensesData.expenses.map((expense, index) => (
                          <div key={expense.id} className="bg-white rounded-lg p-3 border border-red-200">
                            <p className="font-medium text-gray-800">{expense.description}</p>
                            <div className="flex justify-between items-center">
                              {expense.receipt_image && (
                                <img 
                                  src={expense.receipt_image} 
                                  alt="Receipt"
                                  className="w-24 h-24 object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                                  onClick={() => window.open(expense.receipt_image!, '_blank')}
                                />
                              )}
                              <span className="bg-red-100 text-red-800 text-sm px-2 py-1 rounded-full">
                                -₹{expense.amount}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Material Testing */}
            {reportData.materialTests.length > 0 && (
              <div className="bg-cyan-50 rounded-lg p-6">
                <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <TestTube className="w-5 h-5 text-cyan-600" />
                  Material Testing ({reportData.materialTests.length})
                </h4>
                <div className="space-y-4">
                  {reportData.materialTests.map((test, index) => (
                    <div key={test.id} className="bg-white rounded-lg p-4 border border-cyan-200">
                      <h5 className="font-medium text-gray-800 mb-2">{test.test_type}</h5>
                      <p className="text-sm text-gray-600 mb-3">{test.description}</p>
                      {test.test_images.length > 0 && (
                        <div className="flex gap-2 flex-wrap">
                          {test.test_images.map((image, idx) => (
                            <img 
                              key={idx}
                              src={image} 
                              alt={`Test ${idx + 1}`}
                              className="w-32 h-32 object-cover rounded-lg border border-gray-300 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                              onClick={() => window.open(image, '_blank')}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Report Footer */}
          <div className="text-center border-t border-gray-200 pt-6 text-gray-500 space-y-2">
            <p>Generated on: {new Date().toLocaleString()}</p>
            <p className="text-sm">DPR Management System - Built for Construction Excellence</p>
            <p className="text-lg font-semibold text-gray-700 mt-4">Gopal Deshmukh</p>
          </div>
        </div>
      </div>
    </div>
  )
}