import React, { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { authApi } from '../api/authApi'
import { setCredentials } from '../features/auth/authSlice'
import LoadingSpinner from '../components/LoadingSpinner'

// Landing page for the Google OAuth2 redirect: the backend issues our own
// JWT and appends it as ?token=... ; we exchange it for the user profile.
export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      navigate('/login')
      return
    }
    localStorage.setItem('shopstack_access_token', token)
    authApi.me()
      .then(({ data }) => {
        dispatch(setCredentials({ ...data.data, accessToken: token }))
        navigate('/')
      })
      .catch(() => navigate('/login'))
  }, [searchParams, dispatch, navigate])

  return <LoadingSpinner label="Finishing sign-in..." />
}
