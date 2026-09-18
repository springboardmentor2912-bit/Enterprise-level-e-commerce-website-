import React, { useEffect, useState } from 'react'
import { warehouseApi } from '../../api/warehouseApi'
import { shipmentApi } from '../../api/shipmentApi'
import LoadingSpinner from '../../components/LoadingSpinner'
import ErrorBanner from '../../components/ErrorBanner'

const nextTaskStatus = { PENDING: 'PICKING', PICKING: 'PACKED', PACKED: 'READY_FOR_SHIPMENT' }
const taskStatusLabels = {
  PENDING: 'Pending',
  PICKING: 'Picking',
  PACKED: 'Packed',
  READY_FOR_SHIPMENT: 'Ready for shipment',
}

const shipmentProgression = {
  SHIPPED: 'IN_TRANSIT',
  IN_TRANSIT: 'OUT_FOR_DELIVERY',
  OUT_FOR_DELIVERY: 'DELIVERED',
}
const shipmentStatusLabels = {
  PREPARING: 'Preparing',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'In transit',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Delivery failed',
}

export default function WarehouseDashboardPage() {
  const [tasks, setTasks] = useState([])
  const [shipments, setShipments] = useState({}) // orderId -> shipment response, or null if none yet
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shipForm, setShipForm] = useState({})

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await warehouseApi.tasks({ page: 0, size: 30, includeReady: true })
      const taskList = data.data.content
      setTasks(taskList)

      // For tasks that are ready-for-shipment, check whether a shipment
      // already exists so we can show tracking progression instead of the
      // "enter carrier + tracking" form again.
      const readyTasks = taskList.filter((t) => t.status === 'READY_FOR_SHIPMENT')
      const shipmentEntries = await Promise.all(
        readyTasks.map(async (t) => {
          try {
            const { data: shipData } = await shipmentApi.staffView(t.orderId)
            return [t.orderId, shipData.data]
          } catch {
            return [t.orderId, null]
          }
        })
      )
      setShipments(Object.fromEntries(shipmentEntries))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const advanceTask = async (task) => {
    const newStatus = nextTaskStatus[task.status]
    if (!newStatus) return
    setError('')
    try {
      await warehouseApi.updateTaskStatus(task.id, newStatus)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update task')
    }
  }

  const shipOrder = async (task) => {
    const details = shipForm[task.id]
    if (!details?.carrier || !details?.trackingNumber) {
      setError('Enter a carrier and tracking number before shipping')
      return
    }
    setError('')
    try {
      await shipmentApi.ship(task.orderId, details)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not mark this order as shipped')
    }
  }

  const advanceShipment = async (orderId, newStatus) => {
    setError('')
    try {
      await shipmentApi.updateStatus(orderId, newStatus)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update shipment status')
    }
  }

  if (loading) return <LoadingSpinner />

  return (
    <div className="max-w-5xl mx-auto mt-8 px-2">
      <h1 className="text-2xl font-bold mb-2">Warehouse Dashboard</h1>
      <p className="text-sm text-gray-500 mb-6">
        Testing tip: advance a shipment all the way to "Delivered" here to unlock the customer's return-request option on that order.
      </p>
      <ErrorBanner message={error} />

      {tasks.length === 0 ? (
        <p className="text-gray-400">No fulfillment tasks right now.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {tasks.map((task) => {
            const shipment = shipments[task.orderId]
            return (
              <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-medium">{task.orderNumber}</p>
                    <p className="text-xs text-gray-400">Updated {new Date(task.updatedAt).toLocaleString()}</p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 font-medium">
                    {taskStatusLabels[task.status] || task.status}
                  </span>
                </div>

                {task.status !== 'READY_FOR_SHIPMENT' ? (
                  <button onClick={() => advanceTask(task)}
                    className="bg-brand-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-brand-700">
                    Mark as {taskStatusLabels[nextTaskStatus[task.status]]}
                  </button>
                ) : !shipment ? (
                  <div className="flex gap-2 items-center">
                    <input placeholder="Carrier (e.g. Delhivery)"
                      value={shipForm[task.id]?.carrier || ''}
                      onChange={(e) => setShipForm((prev) => ({ ...prev, [task.id]: { ...prev[task.id], carrier: e.target.value } }))}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm flex-1" />
                    <input placeholder="Tracking number"
                      value={shipForm[task.id]?.trackingNumber || ''}
                      onChange={(e) => setShipForm((prev) => ({ ...prev, [task.id]: { ...prev[task.id], trackingNumber: e.target.value } }))}
                      className="border border-gray-300 rounded-md px-2 py-1.5 text-sm flex-1" />
                    <button onClick={() => shipOrder(task)}
                      className="bg-green-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-green-700 whitespace-nowrap">
                      Mark shipped
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-gray-50 rounded-md px-3 py-2">
                    <div className="text-sm">
                      <p><span className="text-gray-500">Carrier:</span> {shipment.carrier} · <span className="text-gray-500">Tracking:</span> {shipment.trackingNumber}</p>
                      <p className="font-medium mt-0.5">{shipmentStatusLabels[shipment.status] || shipment.status}</p>
                    </div>
                    <div className="flex gap-2">
                      {shipmentProgression[shipment.status] && (
                        <button onClick={() => advanceShipment(task.orderId, shipmentProgression[shipment.status])}
                          className="bg-brand-600 text-white rounded-md px-3 py-1.5 text-sm hover:bg-brand-700 whitespace-nowrap">
                          Mark as {shipmentStatusLabels[shipmentProgression[shipment.status]]}
                        </button>
                      )}
                      {shipment.status !== 'DELIVERED' && shipment.status !== 'FAILED' && (
                        <button onClick={() => advanceShipment(task.orderId, 'FAILED')}
                          className="border border-red-300 text-red-600 rounded-md px-3 py-1.5 text-sm hover:bg-red-50 whitespace-nowrap">
                          Mark failed
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
