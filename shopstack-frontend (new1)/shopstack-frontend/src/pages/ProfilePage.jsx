import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { authApi } from '../api/authApi'
import { addressApi } from '../api/addressApi'
import { updateUser } from '../features/auth/authSlice'
import ErrorBanner from '../components/ErrorBanner'

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const [form, setForm] = useState({ fullName: user?.fullName || '', phone: user?.phone || '' })
  const [addresses, setAddresses] = useState([])
  const [addressForm, setAddressForm] = useState({
    label: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', contactPhone: '', isDefault: false,
  })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    addressApi.list().then(({ data }) => setAddresses(data.data)).catch(() => {})
  }, [])

  const saveProfile = async (e) => {
    e.preventDefault()
    setError(''); setMessage('')
    try {
      const { data } = await authApi.updateProfile(form)
      dispatch(updateUser({ fullName: data.data.fullName, phone: data.data.phone }))
      setMessage('Profile updated')
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile')
    }
  }

  const addAddress = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const { data } = await addressApi.add(addressForm)
      setAddresses((prev) => [...prev, data.data])
      setAddressForm({ label: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', contactPhone: '', isDefault: false })
    } catch (err) {
      setError(err.response?.data?.message || 'Could not add address')
    }
  }

  const removeAddress = async (id) => {
    await addressApi.remove(id)
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 flex flex-col gap-8">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Profile</h2>
        <ErrorBanner message={error} />
        {message && <p className="text-green-600 text-sm mb-4">{message}</p>}
        <form onSubmit={saveProfile} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium">Full name</label>
            <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Phone</label>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full border border-gray-300 rounded-md px-3 py-2" />
          </div>
          <button className="self-start bg-brand-600 text-white rounded-md px-4 py-2 font-medium hover:bg-brand-700">Save</button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h2 className="text-lg font-semibold mb-4">Shipping addresses</h2>
        <div className="flex flex-col gap-3 mb-6">
          {addresses.length === 0 && <p className="text-sm text-gray-400">No addresses saved yet.</p>}
          {addresses.map((a) => (
            <div key={a.id} className="border border-gray-200 rounded-md p-3 flex justify-between items-start text-sm">
              <div>
                <p className="font-medium">{a.label} {a.default && <span className="text-xs text-brand-600">(Default)</span>}</p>
                <p className="text-gray-500">{a.addressLine1}, {a.addressLine2 && `${a.addressLine2}, `}{a.city}, {a.state} {a.postalCode}, {a.country}</p>
              </div>
              <button onClick={() => removeAddress(a.id)} className="text-red-500 hover:text-red-700">Remove</button>
            </div>
          ))}
        </div>

        <h3 className="font-medium mb-3 text-sm">Add a new address</h3>
        <form onSubmit={addAddress} className="grid grid-cols-2 gap-3 text-sm">
          <input placeholder="Label (Home, Work...)" value={addressForm.label}
            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
          <input required placeholder="Address line 1" value={addressForm.addressLine1}
            onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
          <input placeholder="Address line 2" value={addressForm.addressLine2}
            onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
          <input required placeholder="City" value={addressForm.city}
            onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2" />
          <input required placeholder="State" value={addressForm.state}
            onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2" />
          <input required placeholder="Postal code" value={addressForm.postalCode}
            onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2" />
          <input required placeholder="Country" value={addressForm.country}
            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2" />
          <input placeholder="Contact phone" value={addressForm.contactPhone}
            onChange={(e) => setAddressForm({ ...addressForm, contactPhone: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 col-span-2" />
          <label className="flex items-center gap-2 col-span-2 text-gray-500">
            <input type="checkbox" checked={addressForm.isDefault}
              onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })} />
            Set as default address
          </label>
          <button className="col-span-2 bg-brand-600 text-white rounded-md py-2 font-medium hover:bg-brand-700">Add address</button>
        </form>
      </div>
    </div>
  )
}
