import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { orderApi } from '../api/orderApi'
import { shipmentApi } from '../api/shipmentApi'
import { returnApi } from '../api/returnApi'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

const shipmentStatusLabels = {
  PREPARING: 'Preparing',
  SHIPPED: 'Shipped',
  IN_TRANSIT: 'In transit',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  FAILED: 'Delivery failed',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [shipment, setShipment] = useState(null)
  const [myReturn, setMyReturn] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState(false)

  const [showReturnForm, setShowReturnForm] = useState(false)
  const [returnReason, setReturnReason] = useState('')
  const [submittingReturn, setSubmittingReturn] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const { data } = await orderApi.getOne(id)
      setOrder(data.data)

      // Shipment may not exist yet for a fresh order — that's fine, not an error.
      try {
        const { data: shipData } = await shipmentApi.track(id)
        setShipment(shipData.data)
      } catch { /* no shipment yet */ }

      try {
        const { data: returnsData } = await returnApi.mine()
        const existing = returnsData.data.find((r) => r.orderId === Number(id))
        if (existing) setMyReturn(existing)
      } catch { /* ignore */ }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async () => {
    setError('')
    setCancelling(true)
    try {
      const { data } = await orderApi.cancel(id)
      setOrder(data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel this order')
    } finally {
      setCancelling(false)
    }
  }

  const handleSubmitReturn = async (e) => {
    e.preventDefault()
    setError('')
    setSubmittingReturn(true)
    try {
      const { data } = await returnApi.request(id, { reason: returnReason })
      setMyReturn(data.data)
      setShowReturnForm(false)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit return request')
    } finally {
      setSubmittingReturn(false)
    }
  }

  if (loading) return <LoadingSpinner />
  if (!order) return <p className="text-center py-16 text-gray-400">Order not found.</p>

  const canCancel = ['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status)
  const canReturn = order.status === 'DELIVERED' && !myReturn

  return (
    <div className="max-w-3xl mx-auto mt-8 px-2">
      <ErrorBanner message={error} />
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-xl font-bold">{order.orderNumber}</h1>
            <p className="text-sm text-gray-500">Placed on {new Date(order.createdAt).toLocaleString()}</p>
          </div>
          <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full">{order.status}</span>
        </div>

        <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>{item.productName} × {item.quantity}</span>
              <span>₹{item.lineTotal}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-1 border-t border-gray-100 pt-4 mt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>₹{order.subtotal}</span></div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Coupon discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
              <span>−₹{order.discountAmount}</span>
            </div>
          )}
          <div className="flex justify-between"><span>Shipping</span><span>₹{order.shippingFee}</span></div>
          <div className="flex justify-between font-semibold text-base"><span>Total</span><span>₹{order.totalAmount}</span></div>
          <div className="flex justify-between text-gray-500"><span>Payment status</span><span>{order.paymentStatus}</span></div>
        </div>

        {canCancel && (
          <button onClick={handleCancel} disabled={cancelling}
            className="mt-6 border border-red-300 text-red-600 rounded-md px-4 py-2 text-sm font-medium hover:bg-red-50 disabled:opacity-50">
            {cancelling ? 'Cancelling...' : 'Cancel order'}
          </button>
        )}
      </div>

      {shipment && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
          <h2 className="font-semibold mb-3">Shipment tracking</h2>
          <div className="flex flex-col gap-1 text-sm">
            <div className="flex justify-between"><span>Carrier</span><span>{shipment.carrier}</span></div>
            <div className="flex justify-between"><span>Tracking number</span><span>{shipment.trackingNumber}</span></div>
            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-medium">{shipmentStatusLabels[shipment.status] || shipment.status}</span>
            </div>
            {shipment.estimatedDelivery && (
              <div className="flex justify-between">
                <span>Estimated delivery</span>
                <span>{new Date(shipment.estimatedDelivery).toLocaleDateString()}</span>
              </div>
            )}
            {shipment.deliveredAt && (
              <div className="flex justify-between">
                <span>Delivered on</span>
                <span>{new Date(shipment.deliveredAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-6 mt-6">
        <h2 className="font-semibold mb-3">Returns & refunds</h2>

        {myReturn ? (
          <div className="text-sm">
            <p><span className="text-gray-500">Status:</span> <span className="font-medium">{myReturn.status}</span></p>
            <p className="text-gray-500 mt-1">Reason: {myReturn.reason}</p>
            {myReturn.adminNotes && <p className="text-gray-500 mt-1">Note from support: {myReturn.adminNotes}</p>}
          </div>
        ) : canReturn ? (
          showReturnForm ? (
            <form onSubmit={handleSubmitReturn} className="flex flex-col gap-3">
              <textarea required value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
                placeholder="Tell us why you'd like to return this order..."
                className="border border-gray-300 rounded-md px-3 py-2 text-sm" rows={3} />
              <div className="flex gap-2">
                <button type="submit" disabled={submittingReturn}
                  className="bg-brand-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
                  {submittingReturn ? 'Submitting...' : 'Submit return request'}
                </button>
                <button type="button" onClick={() => setShowReturnForm(false)}
                  className="text-gray-500 text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowReturnForm(true)}
              className="border border-gray-300 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-50">
              Request a return
            </button>
          )
        ) : (
          <p className="text-sm text-gray-400">
            {order.status === 'DELIVERED' ? 'A return request already exists for this order.' : 'Returns are available once this order is delivered.'}
          </p>
        )}
      </div>
    </div>
  )
}
