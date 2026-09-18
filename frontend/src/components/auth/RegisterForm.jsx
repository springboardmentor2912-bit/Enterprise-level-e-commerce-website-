import { useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Link,
  TextField,
  Typography,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { registerUser } from "../../api/authService";

function RegisterForm() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await registerUser(formData);

      console.log("REGISTRATION RESPONSE:", response.data);

      if (response.data?.success) {
        alert(
          response.data?.message ||
            "Registration successful"
        );

        navigate("/");
      } else {
        alert(
          response.data?.message ||
            "Registration Failed"
        );
      }
    } catch (error) {
      console.error(
        "REGISTRATION ERROR:",
        error
      );

      console.error(
        "BACKEND RESPONSE:",
        error.response?.data
      );

      alert(
        error.response?.data?.message ||
          "Registration Failed"
      );
    }
  };

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#f4f6f8",
        }}
      >
        <Card
          sx={{
            width: 500,
            p: 4,
            borderRadius: 3,
            boxShadow: 6,
          }}
        >
          <CardContent
            component="form"
            onSubmit={handleSubmit}
          >
            <Typography
              variant="h4"
              align="center"
              gutterBottom
            >
              ShopStack
            </Typography>

            <Typography
              variant="body1"
              align="center"
              color="text.secondary"
              mb={4}
            >
              Create Your Account
            </Typography>

            <TextField
              fullWidth
              label="First Name"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              margin="normal"
              required
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              margin="normal"
              required
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ mt: 3 }}
            >
              Register
            </Button>

            <Typography
              align="center"
              mt={3}
            >
              Already have an account?{" "}
              <Link
                component={RouterLink}
                to="/"
              >
                Login
              </Link>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
}

export default RegisterForm;