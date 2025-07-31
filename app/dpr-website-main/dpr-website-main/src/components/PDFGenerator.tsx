import React, { useState } from 'react'
import { FileDown, MessageCircle, Mail, Eye, ArrowRight, RotateCcw } from 'lucide-react'
import { jsPDF } from 'jspdf'
import { ReportPreview } from './ReportPreview'
import type { Contractor } from './ContractorSection'
import type { DepartmentLabour, GenderLabour, SkilledWorker } from './DepartmentLabourSection'
import type { Equipment } from './EquipmentSection'
import type { Visitor } from './VisitorSection'
import type { CriticalIssue } from './CriticalIssuesSection'
import type { TodayWork } from './TodayWorkSection'
import type { TomorrowWork } from './TomorrowWorkSection'
import type { ExpensesData } from './ExpensesSection'
import type { MaterialTest } from './MaterialTestingSection'

interface PDFGeneratorProps {
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
  onEdit: () => void
}

export const PDFGenerator: React.FC<PDFGeneratorProps> = ({ reportData, onEdit }) => {
  const [showPreview, setShowPreview] = useState(false)

  const startNew = () => {
    if (confirm('Are you sure you want to start a new report? This will clear all current data.')) {
      localStorage.removeItem('dpr-data')
      window.location.reload()
    }
  }

  const generatePDF = () => {
    const pdf = new jsPDF()
    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 20
    const contentWidth = pageWidth - (margin * 2)
    const maxContentHeight = pageHeight - 40 // Leave space for header and footer
    let yPosition = 20

    // Helper function to add company footer with page number
    const addFooter = (pageNum: number = 1) => {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Gopal Deshmukh', pageWidth / 2, pageHeight - 10, { align: 'center' })
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 5, { align: 'right' })
    }

    // Helper function to add new page with footer
    let currentPage = 1
    const addNewPage = () => {
      addFooter(currentPage)
      pdf.addPage()
      currentPage++
      yPosition = 20
    }

    // Enhanced page break checker - ensures entire sections don't split
    const checkSectionPageBreak = (sectionHeight: number) => {
      if (yPosition + sectionHeight > maxContentHeight) {
        addNewPage()
        return true
      }
      return false
    }

    // Header
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Daily Progress Report (DPR)', pageWidth / 2, yPosition, { align: 'center' })
    yPosition += 20

    // Site Information
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Site Information', 20, yPosition)
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Site Name: ${reportData.siteName}`, 20, yPosition)
    yPosition += 8
    pdf.text(`Date: ${reportData.date}`, 20, yPosition)
    yPosition += 8
    pdf.text(`Weather: ${reportData.weather}`, 20, yPosition)
    yPosition += 8
    pdf.text(`Temperature: ${reportData.temperature}`, 20, yPosition)
    yPosition += 15

    // Check if we need a new page
    const checkPageBreak = (requiredSpace: number = 30) => {
      if (yPosition + requiredSpace > maxContentHeight) {
        addNewPage()
      }
    }

    // Summary Statistics
    const totalContractorManpower = reportData.contractors.reduce((sum, c) => sum + c.manpower, 0)
    const totalGenderManpower = reportData.labours.genderLabours.reduce((sum, l) => sum + l.manpower, 0)
    const totalSkilledManpower = reportData.labours.skilledWorkers.reduce((sum, l) => sum + l.skilled_manpower, 0)
    const totalLabourManpower = totalGenderManpower + totalSkilledManpower
    const totalManpower = totalContractorManpower + totalLabourManpower
    const totalReceived = reportData.expensesData.pettyCash.reduce((sum, pc) => sum + pc.amount, 0)
    const totalExpenses = reportData.expensesData.expenses.reduce((sum, exp) => sum + exp.amount, 0)
    const balance = totalReceived - totalExpenses

    checkPageBreak(40)
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Summary', margin, yPosition)
    yPosition += 10

    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text(`Total Contractors: ${reportData.contractors.length}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Total Manpower: ${totalManpower}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Equipment in Use: ${reportData.equipment.length}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Visitors Today: ${reportData.visitors.length}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Critical Issues: ${reportData.issues.length}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Today's Work Items: ${reportData.todayWork.length}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Tomorrow's Work Items: ${reportData.tomorrowWork.length}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Cash Balance: ₹${balance.toFixed(2)}`, margin, yPosition)
    yPosition += 8
    pdf.text(`Material Tests: ${reportData.materialTests.length}`, margin, yPosition)
    yPosition += 15

    // Contractors Section
    if (reportData.contractors.length > 0) {
      const sectionHeight = 40 + (reportData.contractors.length * 35)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Contractors', margin, yPosition)
      yPosition += 10

      reportData.contractors.forEach((contractor, index) => {
        checkPageBreak(35)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${contractor.name} (${contractor.role})`, margin + 5, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Manpower: ${contractor.manpower}`, margin + 10, yPosition)
        yPosition += 8
        if (contractor.working_description) {
          const descLines = pdf.splitTextToSize(`Description: ${contractor.working_description}`, contentWidth - 40)
          checkPageBreak(descLines.length * 6 + 10)
          pdf.text(descLines, margin + 10, yPosition)
          yPosition += descLines.length * 6 + 5
        } else {
          yPosition += 5
        }
      })
      yPosition += 10
    }

    // Department Labours Section
    if (reportData.labours.genderLabours.length > 0 || reportData.labours.skilledWorkers.length > 0) {
      const sectionHeight = 60 + (reportData.labours.genderLabours.length * 15) + (reportData.labours.skilledWorkers.length * 25)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Department Labours', margin, yPosition)
      yPosition += 10

      // Gender-based workers
      if (reportData.labours.genderLabours.length > 0) {
        checkPageBreak(25)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Gender-based Workers:', margin + 5, yPosition)
        yPosition += 8
        
        reportData.labours.genderLabours.forEach((labour, index) => {
          checkPageBreak(15)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${index + 1}. ${labour.gender}: ${labour.manpower} workers`, margin + 10, yPosition)
          yPosition += 8
        })
        yPosition += 5
      }

      // Skilled workers
      if (reportData.labours.skilledWorkers.length > 0) {
        checkPageBreak(25)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text('Skilled Workers:', margin + 5, yPosition)
        yPosition += 8
        
        reportData.labours.skilledWorkers.forEach((worker, index) => {
          checkPageBreak(35)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${index + 1}. ${worker.skilled_worker}: ${worker.skilled_manpower} workers`, margin + 10, yPosition)
          yPosition += 8
          if (worker.working_description) {
            const descLines = pdf.splitTextToSize(`Description: ${worker.working_description}`, contentWidth - 40)
            checkPageBreak(descLines.length * 6 + 10)
            pdf.text(descLines, margin + 10, yPosition)
            yPosition += descLines.length * 6 + 5
          } else {
            yPosition += 5
          }
        })
      }
      yPosition += 10
    }

    // Equipment Section
    if (reportData.equipment.length > 0) {
      const sectionHeight = 40 + (reportData.equipment.length * 35)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Equipment & Machinery', margin, yPosition)
      yPosition += 10

      reportData.equipment.forEach((eq, index) => {
        checkPageBreak(35)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${eq.machine_type}`, margin + 5, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Time: ${eq.from_time} - ${eq.to_time}`, margin + 10, yPosition)
        yPosition += 8
        if (eq.working_description) {
          const descLines = pdf.splitTextToSize(`Description: ${eq.working_description}`, contentWidth - 40)
          checkPageBreak(descLines.length * 6 + 10)
          pdf.text(descLines, margin + 10, yPosition)
          yPosition += descLines.length * 6 + 5
        } else {
          yPosition += 5
        }
      })
      yPosition += 10
    }

    // Visitors Section
    if (reportData.visitors.length > 0) {
      const sectionHeight = 30 + (reportData.visitors.length * 20)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Today\'s Visitors', 20, yPosition)
      yPosition += 10

      reportData.visitors.forEach((visitor, index) => {
        checkPageBreak(20)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${visitor.visitor_types.join(', ')}`, 25, yPosition)
        yPosition += 8
        if (visitor.visit_description) {
          pdf.setFont('helvetica', 'normal')
          const descLines = pdf.splitTextToSize(`Purpose: ${visitor.visit_description}`, pageWidth - 60)
          pdf.text(descLines, 30, yPosition)
          yPosition += descLines.length * 6 + 5
        } else {
          yPosition += 5
        }
      })
      yPosition += 10
    }

    // Critical Issues Section
    if (reportData.issues.length > 0) {
      const sectionHeight = 30 + (reportData.issues.length * 25)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Critical Site Issues', 20, yPosition)
      yPosition += 10

      reportData.issues.forEach((issue, index) => {
        checkPageBreak(20)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. Critical Issue`, 25, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        const descLines = pdf.splitTextToSize(`Description: ${issue.description}`, pageWidth - 60)
        pdf.text(descLines, 30, yPosition)
        yPosition += descLines.length * 6 + 5
      })
      yPosition += 10
    }

    // Today's Work Section
    if (reportData.todayWork.length > 0) {
      const sectionHeight = 30 + (reportData.todayWork.length * 35)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Today\'s Work', 20, yPosition)
      yPosition += 10

      reportData.todayWork.forEach((work, index) => {
        checkPageBreak(30)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${work.work_categories.join(', ')}`, 25, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Quantity: ${work.quantity} | Manpower: ${work.manpower}`, 30, yPosition)
        yPosition += 8
        if (work.working_description) {
          const descLines = pdf.splitTextToSize(`Description: ${work.working_description}`, pageWidth - 60)
          pdf.text(descLines, 30, yPosition)
          yPosition += descLines.length * 6 + 5
        } else {
          yPosition += 5
        }
      })
      yPosition += 10
    }

    // Tomorrow's Work Section
    if (reportData.tomorrowWork.length > 0) {
      const sectionHeight = 30 + (reportData.tomorrowWork.length * 30)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Tomorrow\'s Work', 20, yPosition)
      yPosition += 10

      reportData.tomorrowWork.forEach((work, index) => {
        checkPageBreak(25)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${work.work_categories.join(', ')}`, 25, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Quantity: ${work.quantity} | Manpower: ${work.manpower}`, 30, yPosition)
        yPosition += 8
        if (work.working_description) {
          const descLines = pdf.splitTextToSize(`Description: ${work.working_description}`, pageWidth - 60)
          pdf.text(descLines, 30, yPosition)
          yPosition += descLines.length * 6 + 5
        } else {
          yPosition += 5
        }
      })
      yPosition += 10
    }

    // Expenses Section
    if (reportData.expensesData.pettyCash.length > 0 || reportData.expensesData.expenses.length > 0) {
      const sectionHeight = 80 + (reportData.expensesData.pettyCash.length * 15) + (reportData.expensesData.expenses.length * 15)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Expenses / Petty Cash', 20, yPosition)
      yPosition += 10

      // Financial Summary
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Financial Summary:', 25, yPosition)
      yPosition += 8
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Total Received: ₹${totalReceived.toFixed(2)}`, 30, yPosition)
      yPosition += 6
      pdf.text(`Total Expenses: ₹${totalExpenses.toFixed(2)}`, 30, yPosition)
      yPosition += 6
      pdf.text(`Balance: ₹${balance.toFixed(2)}`, 30, yPosition)
      yPosition += 10

      // Petty Cash entries
      if (reportData.expensesData.pettyCash.length > 0) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Received Cash:', 25, yPosition)
        yPosition += 8
        reportData.expensesData.pettyCash.forEach((cash, index) => {
          checkPageBreak(15)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${index + 1}. ${cash.details} - ₹${cash.amount} (${cash.date})`, 30, yPosition)
          yPosition += 8
        })
        yPosition += 5
      }

      // Expense entries
      if (reportData.expensesData.expenses.length > 0) {
        pdf.setFont('helvetica', 'bold')
        pdf.text('Expenses:', 25, yPosition)
        yPosition += 8
        reportData.expensesData.expenses.forEach((expense, index) => {
          checkPageBreak(15)
          pdf.setFont('helvetica', 'normal')
          pdf.text(`${index + 1}. ${expense.description} - ₹${expense.amount}`, 30, yPosition)
          yPosition += 8
        })
      }
      yPosition += 10
    }

    // Material Testing Section
    if (reportData.materialTests.length > 0) {
      const sectionHeight = 30 + (reportData.materialTests.length * 30)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Material Testing', 20, yPosition)
      yPosition += 10

      reportData.materialTests.forEach((test, index) => {
        checkPageBreak(25)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${test.test_type}`, 25, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        const descLines = pdf.splitTextToSize(`Description: ${test.description}`, pageWidth - 60)
        pdf.text(descLines, 30, yPosition)
        yPosition += descLines.length * 6 + 10
      })
    }

    // Footer
    addFooter(currentPage)

    return pdf
  }

  const downloadPDF = () => {
    const pdf = generatePDF()
    const fileName = `DPR_${reportData.siteName.replace(/\s+/g, '_')}_${reportData.date}.pdf`
    pdf.save(fileName)
  }

  const shareViaWhatsApp = () => {
    const pdf = generatePDF()
    const fileName = `DPR_${reportData.siteName.replace(/\s+/g, '_')}_${reportData.date}.pdf`
    
    const message = `Daily Progress Report for ${reportData.siteName} - ${reportData.date}`
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    
    // Open WhatsApp with message
    window.open(whatsappUrl, '_blank')
    
    // Also trigger download so user can manually attach
    pdf.save(fileName)
  }

  const shareViaEmail = () => {
    const pdf = generatePDF()
    const fileName = `DPR_${reportData.siteName.replace(/\s+/g, '_')}_${reportData.date}.pdf`
    
    const subject = `Daily Progress Report - ${reportData.siteName} - ${reportData.date}`
    const body = `Please find attached the Daily Progress Report for ${reportData.siteName} dated ${reportData.date}.`

    const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    
    // Open email client
    window.open(mailtoUrl)
    
    // Also trigger download so user can manually attach
    pdf.save(fileName)
  }

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Generate & Share Report</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={startNew}
            className="flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            Start New
          </button>
          
          <button
            onClick={() => setShowPreview(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Eye className="w-5 h-5" />
            Preview Report
          </button>
          
          <button
            onClick={downloadPDF}
            className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors md:col-span-1 lg:col-span-2"
          >
            <FileDown className="w-5 h-5" />
            Download PDF
          </button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4 mt-4">
          <button
            onClick={shareViaWhatsApp}
            className="flex items-center justify-center gap-2 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            WhatsApp
          </button>
          
          <button
            onClick={shareViaEmail}
            className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Mail className="w-5 h-5" />
            Email
          </button>
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onEdit}
            className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <ArrowRight className="w-5 h-5" />
            Back to Edit
          </button>
        </div>
      </div>

      {showPreview && (
        <ReportPreview 
          reportData={reportData} 
          onClose={() => setShowPreview(false)}
          onEdit={() => {
            setShowPreview(false)
            onEdit()
          }}
        />
      )}
    </>
  )
}