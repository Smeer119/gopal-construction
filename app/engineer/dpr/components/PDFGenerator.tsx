import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { Button } from '@/components/ui/button'
import { FileDown, Edit, X, Eye, RotateCcw, ArrowRight } from 'lucide-react'
import { useRef, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
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
  // Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  )

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
    
    // Text sanitization and currency formatting helpers
    // Removes invisible/formatting and superscript digits that sometimes creep into inputs
    const sanitize = (v: string | number | null | undefined): string => {
      if (v === null || v === undefined) return ''
      return v
        .toString()
        .normalize('NFKC')
        .replace(/[\u00B9\u2070-\u2079\u200B-\u200D\uFEFF]/g, '') // superscripts, zero-width, BOM
        .replace(/\u00A0/g, ' ') // no-break space -> normal space
        .trim()
    }

    // Standardized table renderer: gray headers, black text, thicker black borders
    const renderTable = (options: Parameters<typeof autoTable>[1]) => {
      const base = {
        margin: { left: margin, right: margin },
        theme: 'grid' as const,
        styles: {
          font: 'helvetica',
          fontSize: 10,
          textColor: [0, 0, 0] as [number, number, number],
          lineColor: [0, 0, 0] as [number, number, number],
          lineWidth: 0.4,
        },
        headStyles: {
          fillColor: [220, 220, 220] as [number, number, number], // unify to darker gray
          textColor: [0, 0, 0] as [number, number, number],       // black header text
          fontStyle: 'bold' as const,
          lineColor: [0, 0, 0] as [number, number, number],
          lineWidth: 0.6,
        },
        bodyStyles: {
          textColor: [0, 0, 0] as [number, number, number],
        },
        tableLineColor: [0, 0, 0] as [number, number, number],
        tableLineWidth: 0.6,
      }
      autoTable(pdf, { ...base, ...options })
    }

    const formatAmount = (num: number): string => `Rs ${Number(num || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    
    // Queue to render images at the very end, with labels per section
    const imageQueue: { label: string; src: string }[] = []
    
    // Helper function to add company footer with page number
    const addFooter = (pageNum: number) => {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.text('BUILD KAAM', pageWidth / 2, pageHeight - 10, { align: 'center' })
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
    // Draw a uniform gray section header bar with black text
    const drawSectionHeader = (title: string) => {
      checkPageBreak(18)
      pdf.setFillColor(220, 220, 220)
      pdf.rect(margin, yPosition, contentWidth, 10, 'F')
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(14)
      pdf.text(title, margin + 4, yPosition + 7)
      yPosition += 12
    }

    yPosition += 20

    // Site Information (table)
    drawSectionHeader('Site Information')
    renderTable({
      startY: yPosition + 5,
      head: [[ 'Field', 'Value' ]],
      body: [
        ['Site Name', sanitize(reportData.siteName)],
        ['Date', sanitize(reportData.date)],
        ['Weather', sanitize(reportData.weather)],
        ['Temperature', sanitize(reportData.temperature)],
      ],
    })
    yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10

    // Check if we need a new page (function-declared for hoisting)
    function checkPageBreak(requiredSpace: number = 30) {
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
    drawSectionHeader('Summary')
    renderTable({
      startY: yPosition + 5,
      head: [[ 'Metric', 'Value' ]],
      body: [
        ['Total Contractors', sanitize(reportData.contractors.length)],
        ['Total Manpower', sanitize(totalManpower)],
        ['Equipment in Use', sanitize(reportData.equipment.length)],
        ['Visitors Today', sanitize(reportData.visitors.length)],
        ['Critical Issues', sanitize(reportData.issues.length)],
        ["Today's Work Items", sanitize(reportData.todayWork.length)],
        ["Tomorrow's Work Items", sanitize(reportData.tomorrowWork.length)],
        ['Cash Balance', sanitize(formatAmount(balance))],
        ['Material Tests', sanitize(reportData.materialTests.length)],
      ],
    })
    yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10

    // Contractors Section (table)
    if (reportData.contractors.length > 0) {
      drawSectionHeader('Contractors')
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Name', 'Role', 'Manpower', 'Description' ]],
        body: reportData.contractors.map((c, i) => [
          (i + 1).toString(),
          sanitize(c.name),
          sanitize(c.role),
          sanitize(c.manpower),
          sanitize(c.working_description || ''),
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
    }

    // Department Labours (tables)
    if (reportData.labours.genderLabours.length > 0 || reportData.labours.skilledWorkers.length > 0) {
      drawSectionHeader('Department Labours')

      if (reportData.labours.genderLabours.length > 0) {
        renderTable({
          startY: yPosition + 5,
          head: [[ 'S.No.', 'Gender', 'Manpower' ]],
          body: reportData.labours.genderLabours.map((l, i) => [
            (i + 1).toString(), sanitize(l.gender), sanitize(l.manpower)
          ]),
        })
        yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 6
      }

      if (reportData.labours.skilledWorkers.length > 0) {
        renderTable({
          startY: yPosition + 5,
          head: [[ 'S.No.', 'Skilled Worker', 'Manpower', 'Description' ]],
          body: reportData.labours.skilledWorkers.map((w, i) => [
            (i + 1).toString(), sanitize(w.skilled_worker), sanitize(w.skilled_manpower), sanitize(w.working_description || '')
          ]),
        })
        yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
      }
    }

    // Today Work (moved up to match sequence)
    if (reportData.todayWork.length > 0) {
      drawSectionHeader("Today's Work")
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Categories', 'Quantity', 'Manpower', 'Description' ]],
        body: reportData.todayWork.map((w, i) => [
          (i + 1).toString(), sanitize(w.work_categories.join(', ')), sanitize(w.quantity), sanitize(w.manpower), sanitize(w.working_description || '')
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
    }

    // Equipment & Machinery (table)
    if (reportData.equipment.length > 0) {
      drawSectionHeader('Equipment & Machinery')
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Machine', 'From', 'To', 'Description' ]],
        body: reportData.equipment.map((e, i) => [
          (i + 1).toString(), sanitize(e.machine_type), sanitize(e.from_time), sanitize(e.to_time), sanitize(e.working_description || '')
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
    }

    // Tomorrow / Upcoming Work (after Equipment)
    if (reportData.tomorrowWork.length > 0) {
      drawSectionHeader("Tomorrow's Work")
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Categories', 'Quantity', 'Manpower', 'Description' ]],
        body: reportData.tomorrowWork.map((w, i) => [
          (i + 1).toString(), sanitize(w.work_categories.join(', ')), sanitize(w.quantity), sanitize(w.manpower), sanitize(w.working_description || '')
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
    }

    // Material Requirements (table)
    if (reportData.materialRequirements && reportData.materialRequirements.length > 0) {
      drawSectionHeader('Material Requirements')
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Description' ]],
        body: reportData.materialRequirements.map((m, i) => [
          (i + 1).toString(), sanitize(m.description)
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10

      // Material Testing (moved up to match sequence)
      if (reportData.materialTests.length > 0) {
        drawSectionHeader('Material Testing')
        renderTable({
          startY: yPosition + 5,
          head: [[ 'S.No.', 'Test Type', 'Description' ]],
          body: reportData.materialTests.map((t, i) => [
            (i + 1).toString(), sanitize(t.test_type), sanitize(t.description)
          ]),
        })
        yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
        // Queue images to render at end under label
        reportData.materialTests.forEach((t) => {
          (t.test_images || []).forEach((img) => imageQueue.push({ label: `Material Testing - ${sanitize(t.test_type)}`, src: img }))
        })
      }

      // Critical Site Issues (moved up to match sequence)
      if (reportData.issues.length > 0) {
        drawSectionHeader('Critical Site Issues')
        renderTable({
          startY: yPosition + 5,
          head: [[ 'S.No.', 'Description' ]],
          body: reportData.issues.map((iss, i) => [ (i + 1).toString(), sanitize(iss.description) ]),
        })
        yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
      }
    }

    // (Removed narrative Tomorrow's Work to avoid duplication)

    // Today Visitors (moved near end before Expenses)
    if (reportData.visitors.length > 0) {
      drawSectionHeader("Today's Visitors")
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Types', 'Purpose' ]],
        body: reportData.visitors.map((v, i) => [
          (i + 1).toString(), sanitize(v.visitor_types.join(', ')), sanitize(v.visit_description || '')
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 10
    }

    // Petty Cash entries (table)
    if (reportData.expensesData.pettyCash && reportData.expensesData.pettyCash.length > 0) {
      checkPageBreak(30)
      drawSectionHeader('Petty Cash')
      
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Details', 'Date', 'Amount' ]],
        body: reportData.expensesData.pettyCash.map((cash, i) => [
          (i + 1).toString(),
          sanitize(cash.details),
          sanitize(cash.date),
          sanitize(formatAmount(cash.amount)),
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 8
    }

    // Expense entries (table) and receipts after table
    if (reportData.expensesData.expenses && reportData.expensesData.expenses.length > 0) {
      checkPageBreak(30)
      drawSectionHeader('Expenses')
      
      renderTable({
        startY: yPosition + 5,
        head: [[ 'S.No.', 'Description', 'Amount' ]],
        body: reportData.expensesData.expenses.map((exp, i) => [
          (i + 1).toString(),
          sanitize(exp.description),
          sanitize(formatAmount(exp.amount)),
        ]),
      })
      yPosition = ((pdf as any).lastAutoTable?.finalY || yPosition) + 8

      // Queue Expense receipt images to render at end
      const receipts = reportData.expensesData.expenses.map(e => e.receipt_image).filter((img): img is string => !!img)
      receipts.forEach((img) => imageQueue.push({ label: 'Expense Receipt', src: img }))
    }

    // (Removed duplicate custom Material Requirements section)

    // (Material Testing and Critical Site Issues moved earlier)
    // (Moved Today's Work earlier; consolidated Tomorrow's Work above)

    // Render all queued images at the very end, after all tables
    if (imageQueue.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Images', margin, yPosition)
      yPosition += 8
      imageQueue.forEach(({ label, src }) => {
        checkPageBreak(90)
        pdf.setFont('helvetica', 'bold')
        pdf.setFontSize(11)
        pdf.text(sanitize(label), margin, yPosition)
        yPosition += 5
        const type = src.startsWith('data:image/png') ? 'PNG' : 'JPEG'
        try {
          pdf.addImage(src, type as any, margin, yPosition, contentWidth, 0)
          yPosition += 70
        } catch {
          yPosition += 5
        }
      })
      yPosition += 5
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

  // Generate, attempt upload silently, always download locally
  const downloadAndSavePDF = async () => {
    const pdf = generatePDF()
    const fileName = `DPR_${reportData.siteName.replace(/\s+/g, '_')}_${reportData.date}.pdf`
    try {
      const { data: authData } = await supabase.auth.getUser()
      const user = authData?.user
      if (user) {
        const blob = pdf.output('blob') as Blob
        const filePath = `${user.id}/${fileName}`
        const { error: uploadErr } = await supabase.storage.from('dpr').upload(filePath, blob, {
          contentType: 'application/pdf',
          upsert: true,
        })
        if (!uploadErr) {
          const { data: pub } = supabase.storage.from('dpr').getPublicUrl(filePath)
          const pdfUrl = pub?.publicUrl || null
          try {
            const { data: profileRow } = await supabase
              .from('profiles')
              .select('special_code')
              .eq('id', user.id)
              .single()
            const special_code = (profileRow as any)?.special_code || null
            const { error: insertErr } = await supabase.from('dpr_reports').insert({
              user_id: user.id,
              special_code,
              report_date: reportData.date,
              site_name: reportData.siteName,
              pdf_url: pdfUrl,
            })
            if (insertErr) console.error(insertErr)
          } catch (metaErr) {
            console.error(metaErr)
          }
        } else {
          console.error(uploadErr)
        }
      }
    } catch (e) {
      console.error(e)
    } finally {
      // Always download locally; no popups
      pdf.save(fileName)
    }
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
          onClick={() => (window.location.href = '/dashboard/my-reports')}
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Eye className="w-5 h-5" />
          View Generated PDFs
        </button>

        <button
          onClick={downloadAndSavePDF}
          className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors md:col-span-1 lg:col-span-2"
        >
          <FileDown className="w-5 h-5" />
          Download & Save
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