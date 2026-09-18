import { Box, Button, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Home() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f8",
        p: 4,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          ShopStack
        </Typography>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button
            variant="outlined"
            onClick={() => navigate("/profile")}
          >
            Profile
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* Welcome Card */}
      <Card
        sx={{
          maxWidth: 800,
          mx: "auto",
          p: 3,
        }}
      >
        <CardContent>
          <Typography variant="h4" gutterBottom>
            Welcome to ShopStack
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            mb={2}
          >
            Welcome, {user?.email}
          </Typography>

          <Typography variant="body2" mb={3}>
            Role: {user?.role}
          </Typography>

          <Button
            variant="contained"
            onClick={() => navigate("/products")}
          >
            Browse Products
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Home;
