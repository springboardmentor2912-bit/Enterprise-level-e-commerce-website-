import React, { useEffect, useState } from 'react'
import { returnApi } from '../../api/returnApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

export default function AdminReturnsPage() {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState({})

  const load = () => {
    setLoading(true)
    returnApi.pending({ page: 0, size: 30 })
      .then(({ data }) => setReturns(data.data.content))
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const approve = async (id) => {
    setError('')
    try { await returnApi.approve(id, notes[id] || ''); load() }
    catch (err) { setError(err.response?.data?.message || 'Could not approve return') }
  }
  const reject = async (id) => {
    setError('')
    try { await returnApi.reject(id, notes[id] || ''); load() }
    catch (err) { setError(err.response?.data?.message || 'Could not reject return') }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div>
      <ErrorBanner message={error} />
      {returns.length === 0 ? (
        <p className="text-gray-400">No pending return requests.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {returns.map((r) => (
            <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-medium">{r.orderNumber}</p>
                  <p className="text-sm text-gray-500">Reason: {r.reason}</p>
                  <p className="text-xs text-gray-400">Requested {new Date(r.requestedAt).toLocaleString()}</p>
                </div>
              </div>
              <input placeholder="Optional note to the customer" value={notes[r.id] || ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm mb-3" />
              <div className="flex gap-2">
                <button onClick={() => approve(r.id)} className="bg-green-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-green-700">
                  Approve & refund
                </button>
                <button onClick={() => reject(r.id)} className="border border-red-300 text-red-600 rounded-md px-3 py-1.5 text-sm hover:bg-red-50">
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
