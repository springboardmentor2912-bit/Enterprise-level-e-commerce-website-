import { useState, useEffect } from 'react'
import WishlistService from '../services/WishlistService'
import CustomerService from '../services/CustomerService'
import AuthService from '../services/AuthService'

export default function WishlistDrawer({
  isOpen,
  onClose,
  onWishlistUpdated,
  onCartUpdated,
  onOpenCart
}) {
  const user = AuthService.getCurrentUser()
  const [wishlistItems, setWishlistItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [movingId, setMovingId] = useState(null)
  const [removingId, setRemovingId] = useState(null)
  const [message, setMessage] = useState('')

  const fetchWishlist = async () => {
    if (!user?.id) return
    setLoading(true)
    try {
      const items = await WishlistService.getWishlist(user.id)
      setWishlistItems(items)
      if (onWishlistUpdated) onWishlistUpdated(items.length)
    } catch (err) {
      console.error('Error fetching wishlist:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchWishlist()
      setMessage('')
    }
  }, [isOpen, user?.id])

  const handleRemove = async (productId) => {
    if (!user?.id) return
    setRemovingId(productId)
    try {
      await WishlistService.removeFromWishlist(user.id, productId)
      const updated = wishlistItems.filter(item => item.product?.id !== productId)
      setWishlistItems(updated)
      if (onWishlistUpdated) onWishlistUpdated(updated.length)
      setMessage('Item removed from wishlist')
      setTimeout(() => setMessage(''), 3000)
    } catch (err) {
      console.error('Error removing item from wishlist:', err)
    } finally {
      setRemovingId(null)
    }
  }

  const handleMoveToCart = async (product) => {
    if (!user?.id) return
    if (!product.stockQuantity || product.stockQuantity <= 0) {
      alert('This item is currently out of stock.')
      return
    }
    setMovingId(product.id)
    try {
      await CustomerService.addToCart(user.id, product.id, 1)
      await WishlistService.removeFromWishlist(user.id, product.id)
      const updated = wishlistItems.filter(item => item.product?.id !== product.id)
      setWishlistItems(updated)
      if (onWishlistUpdated) onWishlistUpdated(updated.length)
      if (onCartUpdated) onCartUpdated()
      setMessage(`Moved "${product.name}" to cart!`)
      setTimeout(() => setMessage(''), 3500)
    } catch (err) {
      console.error('Error moving item to cart:', err)
      alert(err.response?.data?.message || 'Failed to move item to cart.')
    } finally {
      setMovingId(null)
    }
  }

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        zIndex: 1100,
        display: 'flex',
        justifyContent: 'flex-end',
        transition: 'opacity 0.3s ease'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          height: '100%',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-focus)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.8)',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.5rem',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(20,20,20,0.8)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.4rem' }}>❤️</span>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#fff' }}>
                My Wishlist
              </h2>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close wishlist drawer"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '1.25rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
              borderRadius: 'var(--radius-sm)',
              transition: 'var(--transition)'
            }}
          >
            ✕
          </button>
        </div>

        {/* Message notification */}
        {message && (
          <div
            style={{
              padding: '0.75rem 1.25rem',
              background: 'rgba(212,175,55,0.15)',
              borderBottom: '1px solid var(--gold)',
              color: 'var(--gold)',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            ✓ {message}
          </div>
        )}

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--gold)' }}>
              Loading saved treasures...
            </div>
          ) : wishlistItems.length === 0 ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '70%',
                textAlign: 'center',
                gap: '1rem',
                color: 'var(--text-muted)'
              }}
            >
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.04)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2.5rem'
                }}
              >
                🤍
              </div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', margin: 0 }}>Your Wishlist is Empty</h3>
              <p style={{ fontSize: '0.875rem', maxWidth: '280px', margin: 0, lineHeight: 1.5 }}>
                Save items you love by tapping the heart icon on any product in our collection.
              </p>
              <button
                onClick={onClose}
                style={{
                  marginTop: '1rem',
                  background: 'var(--gold)',
                  color: '#000',
                  border: 'none',
                  padding: '0.65rem 1.5rem',
                  borderRadius: 'var(--radius-btn)',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Discover Collection
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {wishlistItems.map((item) => {
                const prod = item.product || {}
                const isOutOfStock = !prod.stockQuantity || prod.stockQuantity <= 0
                return (
                  <div
                    key={item.id || prod.id}
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-card)',
                      padding: '0.9rem',
                      position: 'relative'
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        width: '85px',
                        height: '85px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        flexShrink: 0,
                        background: '#111',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={prod.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80'}
                        alt={prod.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {prod.discount > 0 && (
                        <span
                          style={{
                            position: 'absolute',
                            top: '4px',
                            left: '4px',
                            background: 'rgba(239,68,68,0.9)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: '800',
                            padding: '1px 5px',
                            borderRadius: '4px'
                          }}
                        >
                          -{prod.discount}%
                        </span>
                      )}
                    </div>

                    {/* Info & Actions */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <h4
                          style={{
                            fontSize: '0.95rem',
                            fontWeight: '700',
                            color: '#fff',
                            margin: '0 0 0.25rem 0',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {prod.name}
                        </h4>
                        <button
                          onClick={() => handleRemove(prod.id)}
                          disabled={removingId === prod.id}
                          title="Remove from wishlist"
                          aria-label={`Remove ${prod.name} from wishlist`}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            padding: '0 0 0 0.5rem',
                            lineHeight: 1
                          }}
                        >
                          {removingId === prod.id ? '…' : '✕'}
                        </button>
                      </div>

                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                        {prod.category || 'Atelier'}
                      </div>

                      {/* Price */}
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.6rem' }}>
                        {prod.discount > 0 ? (
                          <>
                            <span style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '1rem' }}>
                              ${Number(prod.discountedPrice || prod.price).toLocaleString()}
                            </span>
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textDecoration: 'line-through' }}>
                              ${Number(prod.price).toLocaleString()}
                            </span>
                          </>
                        ) : (
                          <span style={{ color: 'var(--gold)', fontWeight: '800', fontSize: '1rem' }}>
                            ${Number(prod.price || 0).toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Move to Cart button */}
                      <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                        <button
                          onClick={() => handleMoveToCart(prod)}
                          disabled={movingId === prod.id || isOutOfStock}
                          style={{
                            flex: 1,
                            padding: '0.45rem 0.75rem',
                            background: isOutOfStock ? 'rgba(255,255,255,0.05)' : 'var(--gold)',
                            color: isOutOfStock ? 'var(--text-muted)' : '#000',
                            border: isOutOfStock ? '1px solid var(--border)' : 'none',
                            borderRadius: 'var(--radius-btn)',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            transition: 'var(--transition)'
                          }}
                        >
                          {movingId === prod.id ? 'Moving...' : isOutOfStock ? 'Out of Stock' : '🛒 Move to Cart'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {wishlistItems.length > 0 && (
          <div
            style={{
              padding: '1.25rem',
              borderTop: '1px solid var(--border)',
              background: 'rgba(15,15,15,0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem'
            }}
          >
            {onOpenCart && (
              <button
                onClick={() => {
                  onClose()
                  onOpenCart()
                }}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--gold)',
                  color: 'var(--gold)',
                  borderRadius: 'var(--radius-btn)',
                  fontWeight: '700',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                View Shopping Cart 🛒
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
