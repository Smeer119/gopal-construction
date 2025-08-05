import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { FileDown, Edit, X, Eye, RotateCcw, ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { format } from 'date-fns'
import { Contractor } from './ContractorSection'
import { DepartmentLabour } from './DepartmentLabourSection'
import { Equipment } from './EquipmentSection'
import { Visitor } from './VisitorSection'
import { CriticalIssue } from './CriticalIssuesSection'
import { TodayWork } from './TodayWorkSection'
import { TomorrowWork } from './TomorrowWorkSection'
import { ExpensesData } from './ExpensesSection'
import type { MaterialTest } from './MaterialTestingSection'
import type { MaterialRequirement } from './MaterialRequirement'

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
    materialRequirements: MaterialRequirement[]
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
    let currentPage = 1
    
    // Helper function to add company footer with page number
    const addFooter = (pageNum: number) => {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Gopal Deshmukh', pageWidth / 2, pageHeight - 10, { align: 'center' })
      pdf.setFontSize(8)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Page ${pageNum}`, pageWidth - 20, pageHeight - 5, { align: 'right' })
    }

    // Helper function to add new page with footer
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

    // Petty Cash entries
    if (reportData.expensesData.pettyCash && reportData.expensesData.pettyCash.length > 0) {
      checkPageBreak(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Petty Cash:', 20, yPosition)
      yPosition += 10
      
      reportData.expensesData.pettyCash.forEach((cash, index: number) => {
        checkPageBreak(15)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${index + 1}. ${cash.details} - ₹${cash.amount} (${cash.date})`, 25, yPosition)
        yPosition += 8
      })
      yPosition += 5
    }

    // Expense entries
    if (reportData.expensesData.expenses.length > 0) {
      checkPageBreak(20)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Expenses:', 20, yPosition)
      yPosition += 10
      
      reportData.expensesData.expenses.forEach((expense, index: number) => {
        checkPageBreak(15)
        pdf.setFont('helvetica', 'normal')
        // Fix amount display by removing any trailing '1' and ensure proper formatting
        const amountText = `₹${expense.amount.toFixed(2)}`.replace(/\.?1$/, '')
        pdf.text(`${index + 1}. ${expense.description} - ${amountText}`, 25, yPosition)
        yPosition += 8
      })
      yPosition += 10
    }

    // Material Requirements Section
    if (reportData.materialRequirements && reportData.materialRequirements.length > 0) {
      const sectionHeight = 40 + (reportData.materialRequirements.length * 20)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Material Requirements', 20, yPosition)
      yPosition += 10

      // Create table header
      pdf.setFillColor(240, 240, 240)
      pdf.rect(20, yPosition, contentWidth, 10, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('S.No.', 25, yPosition + 7)
      pdf.text('Description', 50, yPosition + 7)
      yPosition += 12

      // Add table rows
      pdf.setFont('helvetica', 'normal')
      reportData.materialRequirements.forEach((item: MaterialRequirement, index: number) => {
        checkPageBreak(20)
        
        // Draw row background for better readability
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(20, yPosition - 2, contentWidth, 15, 'F')
        }
        
        // Draw cell borders
        pdf.rect(20, yPosition - 2, contentWidth, 15)
        
        // Add cell content
        pdf.text((index + 1).toString(), 25, yPosition + 8)
        
        // Split description to fit in cell
        const descLines = pdf.splitTextToSize(item.description, contentWidth - 50)
        
        // Add first line of description
        pdf.text(descLines[0], 50, yPosition + 8)
        
        // Handle multi-line descriptions
        if (descLines.length > 1) {
          for (let i = 1; i < descLines.length; i++) {
            checkPageBreak(10)
            yPosition += 6
            pdf.text(descLines[i], 55, yPosition + 8)
          }
        }
        
        yPosition += 15
      })
      
      yPosition += 10
    }

    // Material Tests Section
    if (reportData.materialTests.length > 0) {
      const sectionHeight = 30 + (reportData.materialTests.length * 30)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Material Testing', 20, yPosition)
      yPosition += 10

      reportData.materialTests.forEach((test: MaterialTest, index: number) => {
        checkPageBreak(25)
        pdf.setFontSize(12)
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${index + 1}. ${test.test_type}`, 25, yPosition)
        yPosition += 8
        pdf.setFont('helvetica', 'normal')
        
        // Display test description
        const descLines = pdf.splitTextToSize(test.description, contentWidth - 40)
        checkPageBreak(descLines.length * 6 + 10)
        pdf.text(descLines, 30, yPosition)
        yPosition += descLines.length * 6 + 5
        
        // Display test images if any
        if (test.test_images && test.test_images.length > 0) {
          yPosition += 5
          pdf.setFont('helvetica', 'bold')
          pdf.text('Test Images:', 25, yPosition)
          yPosition += 8
          
          test.test_images.forEach((image, imgIndex) => {
            checkPageBreak(100) // Leave space for image
            try {
              // Add image with max width of contentWidth - 40
              pdf.addImage(image, 'JPEG', 30, yPosition, contentWidth - 40, 0)
              yPosition += 60 // Approximate height for image
            } catch (error) {
              console.error('Error adding image to PDF:', error)
            }
          })
        } else {
          yPosition += 5
        }
      })
      yPosition += 10
    }

    // Material Requirements Section
    if (reportData.materialRequirements && reportData.materialRequirements.length > 0) {
      const sectionHeight = 40 + (reportData.materialRequirements.length * 10)
      checkSectionPageBreak(sectionHeight)
      
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Material Requirements', margin, yPosition)
      yPosition += 10

      // Create table header
      pdf.setFillColor(240, 240, 240)
      pdf.rect(margin, yPosition, contentWidth, 10, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.text('S.No.', margin + 5, yPosition + 7)
      pdf.text('Description', margin + 30, yPosition + 7)
      yPosition += 12

      // Add table rows
      pdf.setFont('helvetica', 'normal')
      reportData.materialRequirements.forEach((item, index) => {
        checkPageBreak(15)
        
        // Draw row background for better readability
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250)
          pdf.rect(margin, yPosition - 2, contentWidth, 10, 'F')
        }
        
        // Draw cell borders
        pdf.rect(margin, yPosition - 2, contentWidth, 10)
        
        // Add cell content
        pdf.text((index + 1).toString(), margin + 8, yPosition + 5)
        
        // Split description to fit in cell
        const descLines = pdf.splitTextToSize(item.description, contentWidth - 40)
        let descY = yPosition + 5
        
        pdf.text(descLines[0], margin + 30, descY)
        
        // Handle multi-line descriptions
        if (descLines.length > 1) {
          for (let i = 1; i < descLines.length; i++) {
            checkPageBreak(10)
            yPosition += 6
            pdf.text(descLines[i], margin + 35, yPosition + 5)
          }
        }
        
        yPosition += 12
      })
      
      yPosition += 10
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

      {showPreview && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Report Preview</h2>
              <button 
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="border border-gray-200 p-4 rounded-lg">
              <p className="text-gray-600">PDF preview would be displayed here</p>
            </div>
            <div className="mt-6 flex justify-end gap-4">
              <button 
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  setShowPreview(false)
                  onEdit()
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}