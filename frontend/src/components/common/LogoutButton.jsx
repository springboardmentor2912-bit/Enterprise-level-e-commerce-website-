import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { useNavigate } from "react-router-dom";

export default function LogoutButton() {

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {

    dispatch(logout());

    navigate("/login");

  };

  return (

    <button
      onClick={handleLogout}
      className="bg-red-600 text-white px-4 py-2 rounded-lg"
    >
      Logout
    </button>

  );
}