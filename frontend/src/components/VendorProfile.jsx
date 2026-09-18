import React, { useEffect, useState } from "react";
import "./VendorProfile.css";
import Sidebar from "./dashboard/Sidebar";


function VendorProfile() {


    const [vendor, setVendor] = useState({

        displayName: sessionStorage.getItem("username") || localStorage.getItem("username") || "Vendor",
        email: sessionStorage.getItem("email") || localStorage.getItem("email") || "vendor@shopstack.com",
        businessName:"",
        phone:"",
        address:"",
        description:""

    });
    const [editing, setEditing] = useState(false);
    const [saving, setSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");





    useEffect(()=>{


        fetchVendorProfile();


    },[]);








    async function fetchVendorProfile(){


        const token = localStorage.getItem("token");


        const response = await fetch(

            "https://shopstack-backend-gjv6.onrender.com/api/vendor/profile",

            {

                method:"GET",

                headers:{

                    "Authorization":`Bearer ${token}`

                }

            }

        );





        if(response.ok){


            const data = await response.json();


            setVendor({
                ...data,
                displayName: data.displayName || localStorage.getItem("username") || "Vendor",
                email: data.email || localStorage.getItem("email") || "vendor@shopstack.com",
                phone: data.phone || data.contactNumber || ""
            });


        }
        else{


            console.log("Unable to load vendor profile");


        }


    }

    async function saveProfile(event) {
        event.preventDefault();
        setSaving(true);
        setSaveMessage("");
        try {
            const response = await fetch("https://shopstack-backend-gjv6.onrender.com/api/vendor/profile", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("token")}`
                },
                body: JSON.stringify({
                    businessName: vendor.businessName,
                    vendorName: vendor.displayName,
                    contactNumber: vendor.phone,
                    address: vendor.address,
                    description: vendor.description
                })
            });
            if (!response.ok) throw new Error("Unable to save profile");
            const saved = await response.json();
            setVendor(current => ({ ...current, ...saved, phone: saved.contactNumber || current.phone }));
            if (vendor.displayName) localStorage.setItem("username", vendor.displayName);
            setEditing(false);
            setSaveMessage("Profile updated successfully.");
        } catch (error) {
            setSaveMessage(error.message);
        } finally {
            setSaving(false);
        }
    }

    function updateField(field, value) {
        setVendor(current => ({ ...current, [field]: value }));
    }







    return (


        <div className="vendor-profile-layout">
            <Sidebar />
            <div className="vendor-profile-container">





            <div className="vendor-profile-card">







                <div className="vendor-profile-header">



                    <div className="vendor-avatar">

                        🏪

                    </div>





                    <div>


                        <h1>

                            {vendor.displayName}

                        </h1>



                        <p className="profile-role">Verified Vendor Account</p>
                        <span className="profile-status">● Active</span>


                    </div>




                </div>









                {editing ? <form className="vendor-details profile-edit-form" onSubmit={saveProfile}>
                    <label>Vendor Name<input value={vendor.displayName} onChange={event => updateField("displayName", event.target.value)} required /></label>
                    <label>Business Name<input value={vendor.businessName} onChange={event => updateField("businessName", event.target.value)} required /></label>
                    <label>Email<input value={vendor.email} readOnly /></label>
                    <label>Contact Number<input value={vendor.phone} onChange={event => updateField("phone", event.target.value)} /></label>
                    <label>Address<input value={vendor.address} onChange={event => updateField("address", event.target.value)} /></label>
                    <label className="full-width-field">Description<textarea value={vendor.description} onChange={event => updateField("description", event.target.value)} rows="4" /></label>
                    <div className="profile-form-actions">
                        <button type="button" className="cancel-profile-btn" onClick={() => setEditing(false)}>Cancel</button>
                        <button type="submit" className="save-profile-btn" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</button>
                    </div>
                </form> : <div className="vendor-details">






                    <div className="detail-box">


                        <h3>

                            Business Name

                        </h3>


                        <p>

                            {vendor.businessName || "Not Added"}

                        </p>


                    </div>







                    <div className="detail-box">


                        <h3>

                            Email

                        </h3>


                        <p>

                            {vendor.email}

                        </p>


                    </div>








                    <div className="detail-box">


                        <h3>

                            Contact Number

                        </h3>


                        <p>

                            {vendor.phone || "Not Added"}

                        </p>


                    </div>








                    <div className="detail-box">


                        <h3>

                            Address

                        </h3>


                        <p>

                            {vendor.address || "Not Added"}

                        </p>


                    </div>









                    <div className="detail-box">


                        <h3>

                            Description

                        </h3>


                        <p>

                            {vendor.description || "Not Added"}

                        </p>


                    </div>





                </div>}









                {!editing && <button className="edit-profile-btn" onClick={() => { setSaveMessage(""); setEditing(true); }}>


                    Edit Profile


                </button>}
                {saveMessage && <p className="profile-save-message">{saveMessage}</p>}






            </div>
            </div>






        </div>


    );


}


export default VendorProfile;
