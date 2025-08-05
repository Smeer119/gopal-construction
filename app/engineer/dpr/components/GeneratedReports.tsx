import { useState, useEffect } from 'react'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import { FileDown, Trash2 } from 'lucide-react'

export const GeneratedReports = () => {
  const supabase = useSupabaseClient()
  const user = useUser()
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchReports = async () => {
      if (!user) return
      
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('dpr_reports')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        
        if (error) throw error
        setReports(data || [])
      } catch (err) {
        console.error('Error fetching reports:', err)
        setError('Failed to load reports')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [user, supabase])

  const deleteReport = async (id: string, pdfUrl: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return
    
    try {
      // Extract file path from URL
      const filePath = pdfUrl.split('/').slice(3).join('/')
      
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('dpr_pdfs')
        .remove([filePath])
      
      if (storageError) throw storageError
      
      // Delete from database
      const { error: dbError } = await supabase
        .from('dpr_reports')
        .delete()
        .eq('id', id)
      
      if (dbError) throw dbError
      
      // Update local state
      setReports(reports.filter(r => r.id !== id))
    } catch (err) {
      console.error('Error deleting report:', err)
      alert('Failed to delete report')
    }
  }

  if (loading) return <div className="text-center py-8">Loading reports...</div>
  if (error) return <div className="text-center py-8 text-red-500">{error}</div>

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Generated Reports</h3>
      
      {reports.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No reports generated yet
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {report.site_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.report_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <a
                        href={report.pdf_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <FileDown className="w-5 h-5" />
                      </a>
                      <button
                        onClick={() => deleteReport(report.id, report.pdf_url)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}