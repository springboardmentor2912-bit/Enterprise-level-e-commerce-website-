import React, { useState } from 'react'
import { adminApi } from '../../api/adminApi'
import ErrorBanner from '../../components/ErrorBanner'

const reports = [
  { key: 'sales', label: 'Sales report' },
  { key: 'orders', label: 'Order report' },
  { key: 'inventory', label: 'Inventory report' },
  { key: 'vendors', label: 'Vendor report' },
  { key: 'financial', label: 'Financial / commission report' },
]

export default function AdminReportsPage() {
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState('')

  const handleDownload = async (key) => {
    setError('')
    setDownloading(key)
    try {
      const response = await adminApi.downloadReport(key)
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `${key}-report.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError('Could not download this report')
    } finally {
      setDownloading('')
    }
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-5">
      <h2 className="font-semibold mb-4">Download reports (CSV)</h2>
      <ErrorBanner message={error} />
      <div className="flex flex-col gap-2">
        {reports.map((r) => (
          <button key={r.key} onClick={() => handleDownload(r.key)} disabled={downloading === r.key}
            className="flex justify-between items-center border border-gray-200 rounded-md px-4 py-3 text-sm hover:bg-gray-50 disabled:opacity-50">
            <span>{r.label}</span>
            <span className="text-brand-600 font-medium">{downloading === r.key ? 'Downloading...' : 'Download'}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
