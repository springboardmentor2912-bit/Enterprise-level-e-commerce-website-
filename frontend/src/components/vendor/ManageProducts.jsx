import { useEffect, useState } from "react";
import { FaLaptop, FaMobileAlt, FaShoppingBag } from "react-icons/fa";
import "./VendorProducts.css";


function ManageProducts() {

    function getSalePrice(product) {
        return Number(product.salePrice ?? (Number(product.price) * (1 - Number(product.discountPercentage || 0) / 100)));
    }

    function getDiscountPercent(product) {
        const original = Number(product.price || 0);
        const discounted = getSalePrice(product);
        return original > discounted ? Math.round((1 - discounted / original) * 100) : 0;
    }


    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editingProduct, setEditingProduct] = useState(null);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [saving, setSaving] = useState(false);




    async function fetchProducts(){

        setLoading(true);
        setError("");

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(
                "https://shopstack-backend-gjv6.onrender.com/api/vendor/products",
                { headers:{ "Authorization":`Bearer ${token}` } }
            );

            if(!response.ok){
                setError(`Unable to load products (${response.status}). Please log in again.`);
                return;
            }

            const data = await response.json();
            setProducts(Array.isArray(data) ? data : []);
        } catch (fetchError) {
            setError("Unable to connect to the backend. Make sure Spring Boot is running.");
        } finally {
            setLoading(false);
        }

    }








    async function deleteProduct(id){


        const confirmDelete = window.confirm(
            "Are you sure you want to delete this product?"
        );



        if(!confirmDelete){

            return;

        }




        const token = localStorage.getItem("token");



        const response = await fetch(

            `https://shopstack-backend-gjv6.onrender.com/api/vendor/products/${id}`,

            {

                method:"DELETE",

                headers:{

                    "Authorization":`Bearer ${token}`

                }

            }

        );





        if(response.ok){


            alert("Product deleted successfully ✅");


            fetchProducts();


        }

        else{


            alert("Failed to delete product ❌");


        }



    }

    async function updateProduct(event) {
        event.preventDefault();
        setSaving(true);

        try {
            const response = await fetch(
                `https://shopstack-backend-gjv6.onrender.com/api/vendor/products/${editingProduct.id}`,
                {
                    method:"PUT",
                    headers:{
                        "Content-Type":"application/json",
                        "Authorization":`Bearer ${localStorage.getItem("token")}`
                    },
                    body:JSON.stringify({
                        name: editingProduct.name,
                        description: editingProduct.description,
                        price:Number(editingProduct.price),
                        discountPercentage:Number(editingProduct.discountPercentage || 0),
                        stock:Number(editingProduct.stock),
                        category: editingProduct.category,
                        imageUrl: editingProduct.imageUrl || null
                    })
                }
            );

            if(response.ok){
                setEditingProduct(null);
                fetchProducts();
            } else {
                const details = await response.json().catch(() => null);
                setError(details?.message || `Unable to update this product (${response.status}).`);
            }
        } catch (updateError) {
            setError("Unable to connect to the backend.");
        } finally {
            setSaving(false);
        }
    }








    function getProductIcon(category){


        if(category?.toLowerCase().includes("laptop")){


            return <FaLaptop />;


        }



        if(category?.toLowerCase().includes("mobile")){


            return <FaMobileAlt />;


        }



        return <FaShoppingBag />;


    }








    useEffect(()=>{


        fetchProducts();
        window.addEventListener("productsUpdated", fetchProducts);
        return () => window.removeEventListener("productsUpdated", fetchProducts);


    },[]);








    return (


        <div className="manage-products-page">



            <div className="products-header">

                <h1>
                    📦 Manage Products
                </h1>

                <p>
                    Manage your store inventory
                </p>

            </div>







            {loading && <div className="products-state">Loading your products...</div>}

            {!loading && error && <div className="products-state products-error">{error}</div>}

            {!loading && !error && products.length === 0 && (
                <div className="products-state">
                    <h2>No products yet</h2>
                    <p>Add your first product to see it here.</p>
                </div>
            )}

            {!loading && !error && products.length > 0 && <div className="products-grid">


            {


                products.map((product)=>(


                    <div 
                        className="modern-product-card"
                        key={product.id}
                        onClick={() => setSelectedProduct(product)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedProduct(product); }}
                    >



                        <div className="product-image">


                            <div className="product-icon">

                                {getProductIcon(product.category)}

                            </div>


                        </div>







                        <div className="product-content">


                            <h2>
                                {product.name}
                            </h2>



                            <p>
                                {product.description}
                            </p>





                            <div className="product-info">


                                <span className="price">

                                    ₹{getSalePrice(product).toLocaleString()}
                                    {getDiscountPercent(product) > 0 && <del>₹{Number(product.price).toLocaleString()}</del>}
                                    {getDiscountPercent(product) > 0 && <small className="product-discount-label">{getDiscountPercent(product)}% OFF</small>}

                                </span>



                                <span className="category">

                                    {product.category}

                                </span>

                                <span className="stock">

                                    Stock: {product.stock}

                                </span>


                            </div>






                            <div className="product-actions">



                                <button className="edit-btn" onClick={(event) => { event.stopPropagation(); setEditingProduct({ ...product }); }}>

                                    ✏️ Edit

                                </button>





                                <button

                                    className="delete-btn"

                                    onClick={(event) => { event.stopPropagation(); deleteProduct(product.id); }}

                                >

                                    🗑 Delete

                                </button>



                            </div>




                        </div>



                    </div>


                ))


            }


            </div>}

            {selectedProduct && (
                <div className="product-detail-overlay" onClick={() => setSelectedProduct(null)}>
                    <section className="product-detail-modal" role="dialog" aria-modal="true" aria-label="Product details" onClick={(event) => event.stopPropagation()}>
                        <button className="product-detail-close" type="button" onClick={() => setSelectedProduct(null)} aria-label="Close product details">×</button>
                        <div className="product-detail-visual"><div className="product-icon">{getProductIcon(selectedProduct.category)}</div></div>
                        <div className="product-detail-body">
                            <span className="detail-category">{selectedProduct.category || "Uncategorized"}</span>
                            <h2>{selectedProduct.name}</h2>
                            <p className="detail-description">{selectedProduct.description || "No product description available."}</p>
                            <div className="detail-price-row"><div><strong>₹{getSalePrice(selectedProduct).toLocaleString()}</strong>{getDiscountPercent(selectedProduct) > 0 && <del>₹{Number(selectedProduct.price).toLocaleString()}</del>}</div>{getDiscountPercent(selectedProduct) > 0 && <span className="detail-discount">{getDiscountPercent(selectedProduct)}% OFF</span>}</div>
                            <div className="detail-facts"><div><small>Inventory</small><b>{selectedProduct.stock} units</b></div><div><small>Product ID</small><b>#{selectedProduct.id}</b></div><div><small>Availability</small><b className={Number(selectedProduct.stock) > 0 ? "available" : "unavailable"}>{Number(selectedProduct.stock) > 0 ? "In stock" : "Out of stock"}</b></div></div>
                            <button className="detail-edit-button" type="button" onClick={() => { setSelectedProduct(null); setEditingProduct({ ...selectedProduct }); }}>Edit product</button>
                        </div>
                    </section>
                </div>
            )}

            {editingProduct && (
                <div className="edit-product-overlay">
                    <form className="edit-product-modal" onSubmit={updateProduct}>
                        <div className="edit-modal-header">
                            <div><p>Edit Inventory</p><h2>Update Product</h2></div>
                            <button type="button" onClick={() => setEditingProduct(null)}>×</button>
                        </div>
                        <label>Product Name<input value={editingProduct.name || ""} onChange={event => setEditingProduct({ ...editingProduct, name:event.target.value })} required /></label>
                        <label>Available Stock<input type="number" min="0" value={editingProduct.stock ?? 0} onChange={event => setEditingProduct({ ...editingProduct, stock:event.target.value })} required /></label>
                        <label>Price<input type="number" min="0" value={editingProduct.price ?? 0} onChange={event => setEditingProduct({ ...editingProduct, price:event.target.value })} required /></label>
                            <label>Discount percentage (%)<input type="number" min="0" max="100" step="0.01" value={editingProduct.discountPercentage ?? 0} onChange={event => setEditingProduct({ ...editingProduct, discountPercentage:event.target.value })} /></label>
                        <label>Category<input value={editingProduct.category || ""} onChange={event => setEditingProduct({ ...editingProduct, category:event.target.value })} required /></label>
                        <label className="edit-full-field">Description<textarea value={editingProduct.description || ""} onChange={event => setEditingProduct({ ...editingProduct, description:event.target.value })} required /></label>
                        <label className="edit-full-field">Image URL<input value={editingProduct.imageUrl || ""} onChange={event => setEditingProduct({ ...editingProduct, imageUrl:event.target.value })} /></label>
                        <div className="edit-modal-actions"><button type="button" className="cancel-edit-btn" onClick={() => setEditingProduct(null)}>Cancel</button><button type="submit" className="save-edit-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button></div>
                    </form>
                </div>
            )}



        </div>


    );


}


export default ManageProducts;
