import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Profile.css";


function Profile() {


  const navigate = useNavigate();


  const [username, setUsername] = useState("");

  const [email, setEmail] = useState("");

  const [phone, setPhone] = useState("");

  const [address, setAddress] = useState("");

  const [notifications, setNotifications] = useState(true);



  // Load user data from backend

  useEffect(() => {

    fetchUser();

  }, []);




  async function fetchUser(){


    const token = localStorage.getItem("token");


    const response = await fetch(
      "https://shopstack-backend-gjv6.onrender.com/api/users/me",
      {

        method: "GET",

        headers: {

          "Authorization": `Bearer ${token}`

        }

      }

    );



    if(response.ok){


      const data = await response.json();


      setUsername(data.name);

      setEmail(data.email);


    }
    else{

      alert("Unable to load profile");

    }


  }





  async function saveProfile(){



    const token = localStorage.getItem("token");



    const response = await fetch(

      "https://shopstack-backend-gjv6.onrender.com/api/users/profile",

      {

        method:"PUT",

        headers:{

          "Content-Type":"application/json",

          "Authorization": `Bearer ${token}`

        },


        body:JSON.stringify({

          username:username,

          email:email

        })

      }

    );



    if(response.ok){


      const data = await response.json();


      setUsername(data.name);

      setEmail(data.email);


      alert("Profile updated successfully");


    }
    else{

      alert("Profile update failed");

    }


  }





  function logout(){


    localStorage.removeItem("token");


    navigate("/");


  }




  return (


    <div className="profile-container">



      <div className="profile-card">





        <div className="profile-header">


          <div className="avatar">

            {username.charAt(0).toUpperCase()}

          </div>


          <div>

            <h1>
              {username}
            </h1>


            <p>
              {email}
            </p>


          </div>


        </div>




        <hr />




        <h2>
          Personal Information
        </h2>



        <label>
          Username
        </label>


        <input

          value={username}

          onChange={(e)=>setUsername(e.target.value)}

        />




        <label>
          Email
        </label>


        <input

          value={email}

          disabled

        />





        <label>
          Phone Number
        </label>


        <input

          placeholder="+91 XXXXX XXXXX"

          value={phone}

          onChange={(e)=>setPhone(e.target.value)}

        />





        <label>
          Address
        </label>


        <textarea

          placeholder="Enter your address"

          value={address}

          onChange={(e)=>setAddress(e.target.value)}

        />





        <h2>
          Preferences
        </h2>



        <label className="switch">


          <input

            type="checkbox"

            checked={notifications}

            onChange={() =>
              setNotifications(!notifications)
            }

          />


          Enable Email Notifications


        </label>






        <div className="actions">


          <button

            className="save"

            onClick={saveProfile}

          >

            Save Changes


          </button>





          <button

            className="logout"

            onClick={logout}

          >

            Logout


          </button>



        </div>




      </div>



    </div>


  );

}


export default Profile;