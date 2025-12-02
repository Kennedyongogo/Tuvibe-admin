import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert,
  CircularProgress,
  Chip,
  Stack,
  Avatar,
  InputAdornment,
  IconButton,
} from "@mui/material";
import {
  PersonAdd,
  RateReview,
  CheckCircle,
  Error as ErrorIcon,
  PhotoCamera,
  AttachMoney,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import Swal from "sweetalert2";

export default function FakeContent() {
  const [loading, setLoading] = useState(false);
  const [testimonialLoading, setTestimonialLoading] = useState(false);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Fake Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    gender: "",
    category: "Regular",
    county: "",
    bio: "",
    birth_year: "",
    age: "",
    latitude: "",
    longitude: "",
    isVerified: false,
    autoApprove: false, // Default to pending like registration
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Fake Testimonial Form State
  const [testimonialForm, setTestimonialForm] = useState({
    public_user_id: "",
    rating: 5,
    testimonial: "",
    autoApprove: true,
  });

  // Fake Subscription Form State
  const [subscriptionForm, setSubscriptionForm] = useState({
    public_user_id: "",
    plan: "Silver",
    duration_days: 30,
  });

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfileForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please select an image file.",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Please select an image smaller than 10MB.",
          confirmButtonColor: "#D4AF37",
        });
        return;
      }
      setProfileImage(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestimonialChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTestimonialForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubscriptionChange = (e) => {
    const { name, value } = e.target;
    setSubscriptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fetch users for autocomplete
  const fetchUsers = async (query = "") => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams({
        page: "1",
        pageSize: "50", // Limit to 50 for autocomplete
      });
      if (query) {
        params.append("q", query);
      }

      const response = await fetch(`/api/admin-users/public-users?${params}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers("");
  }, []);

  const handleCreateFakeProfile = async () => {
    if (!profileForm.name || !profileForm.username || !profileForm.email) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "Name, username, and email are required",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    // Profile image is required (same as registration)
    if (!profileImage) {
      Swal.fire({
        icon: "error",
        title: "Profile Image Required",
        text: "Profile image is required to create a user profile.",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");

      // Use FormData for file upload (same as registration)
      const formData = new FormData();
      formData.append("profile_image", profileImage);
      formData.append("name", profileForm.name);
      formData.append("username", profileForm.username);
      formData.append("email", profileForm.email);
      if (profileForm.phone) formData.append("phone", profileForm.phone);
      if (profileForm.password)
        formData.append("password", profileForm.password);
      if (profileForm.gender) formData.append("gender", profileForm.gender);
      formData.append("category", profileForm.category);
      if (profileForm.county) formData.append("county", profileForm.county);
      if (profileForm.bio) formData.append("bio", profileForm.bio);
      if (profileForm.birth_year)
        formData.append("birth_year", profileForm.birth_year);
      if (profileForm.age) formData.append("age", profileForm.age);
      if (profileForm.latitude)
        formData.append("latitude", profileForm.latitude);
      if (profileForm.longitude)
        formData.append("longitude", profileForm.longitude);
      formData.append("isVerified", profileForm.isVerified);
      formData.append("autoApprove", profileForm.autoApprove);

      const response = await fetch(
        "/api/admin-users/public-users/create-fake",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            // Don't set Content-Type - browser will set it with boundary for FormData
          },
          body: formData,
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        const loginInfo = data.data.loginCredentials
          ? `\n\nLogin Credentials:\nEmail: ${data.data.loginCredentials.email}\nPassword: ${data.data.loginCredentials.password}`
          : "";
        setSuccessMessage(
          `Fake profile created successfully! User ID: ${data.data.user.id}${loginInfo}`
        );
        Swal.fire({
          icon: "success",
          title: "Profile Created!",
          html: `Fake profile "<strong>${
            profileForm.name
          }</strong>" has been created successfully.<br><br><strong>User ID:</strong> <code style="background: #f0f0f0; padding: 2px 6px; border-radius: 4px;">${
            data.data.user.id
          }</code>${
            data.data.loginCredentials
              ? `<br><br><strong>Login Credentials:</strong><br>Email: <code>${data.data.loginCredentials.email}</code><br>Password: <code>${data.data.loginCredentials.password}</code>`
              : ""
          }<br><br><small style="color: #666;">You can now search and select this user in the Testimonial and Subscription forms below.</small>`,
          confirmButtonColor: "#D4AF37",
        });
        // Reset form
        setProfileForm({
          name: "",
          username: "",
          email: "",
          phone: "",
          password: "",
          gender: "",
          category: "Regular",
          county: "",
          bio: "",
          birth_year: "",
          age: "",
          latitude: "",
          longitude: "",
          isVerified: false,
          autoApprove: false,
        });
        setProfileImage(null);
        setProfileImagePreview(null);
        // Refresh users list to include the newly created user (but don't auto-select)
        fetchUsers();
      } else {
        throw new Error(data.message || "Failed to create fake profile");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to create fake profile");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create fake profile",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFakeTestimonial = async () => {
    if (!testimonialForm.public_user_id || !testimonialForm.rating) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "User ID and rating are required",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setTestimonialLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/api/admin-users/testimonials/create-fake",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            public_user_id: testimonialForm.public_user_id,
            rating: parseInt(testimonialForm.rating),
            testimonial: testimonialForm.testimonial || undefined,
            autoApprove: testimonialForm.autoApprove,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage("Fake testimonial created successfully!");
        Swal.fire({
          icon: "success",
          title: "Testimonial Created!",
          text: "Fake testimonial has been created and approved.",
          confirmButtonColor: "#D4AF37",
        });
        // Reset form
        setTestimonialForm({
          public_user_id: "",
          rating: 5,
          testimonial: "",
          autoApprove: true,
        });
      } else {
        throw new Error(data.message || "Failed to create fake testimonial");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to create fake testimonial");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create fake testimonial",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setTestimonialLoading(false);
    }
  };

  const handleCreateFakeSubscription = async () => {
    if (!subscriptionForm.public_user_id || !subscriptionForm.plan) {
      Swal.fire({
        icon: "error",
        title: "Missing Fields",
        text: "User ID and plan are required",
        confirmButtonColor: "#D4AF37",
      });
      return;
    }

    setSubscriptionLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "/api/admin-users/subscriptions/create-fake",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            public_user_id: subscriptionForm.public_user_id,
            plan: subscriptionForm.plan,
            duration_days: parseInt(subscriptionForm.duration_days) || 30,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage("Fake subscription created successfully!");
        Swal.fire({
          icon: "success",
          title: "Subscription Created!",
          html: `Fake subscription has been created successfully.<br><br><strong>Plan:</strong> ${
            data.data.subscription.plan
          }<br><strong>Amount:</strong> KES ${
            data.data.subscription.amount
          }<br><strong>Status:</strong> ${
            data.data.subscription.status
          }<br><strong>Expires:</strong> ${new Date(
            data.data.subscription.expires_at
          ).toLocaleDateString()}`,
          confirmButtonColor: "#D4AF37",
        });
        // Reset form
        setSubscriptionForm({
          public_user_id: "",
          plan: "Silver",
          duration_days: 30,
        });
      } else {
        throw new Error(data.message || "Failed to create fake subscription");
      }
    } catch (error) {
      setErrorMessage(error.message || "Failed to create fake subscription");
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "Failed to create fake subscription",
        confirmButtonColor: "#D4AF37",
      });
    } finally {
      setSubscriptionLoading(false);
    }
  };

  return (
    <Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          mb: 3,
          background: "linear-gradient(45deg, #D4AF37, #B8941F)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Fake Content Management
      </Typography>

      {successMessage && (
        <Alert
          severity="success"
          icon={<CheckCircle />}
          onClose={() => setSuccessMessage("")}
          sx={{ mb: 3 }}
        >
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert
          severity="error"
          icon={<ErrorIcon />}
          onClose={() => setErrorMessage("")}
          sx={{ mb: 3 }}
        >
          {errorMessage}
        </Alert>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
            Instructions
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Creating Fake Profiles:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2, pl: 2 }}>
            <ul>
              <li>
                Name, username, email, and profile image are required fields
                (same as registration)
              </li>
              <li>
                Profile image must be uploaded using the file picker (same as
                user registration)
              </li>
              <li>
                Phone validation and age checks are bypassed by default for fake
                users
              </li>
              <li>
                By default, photos and bio are set to "pending" (like
                registration) - use Auto-Approve to approve immediately
              </li>
              <li>Verified badge can be enabled for premium appearance</li>
              <li>
                Password is optional - random password generated if not provided
              </li>
              <li>
                Fake profiles are created exactly like real user registrations
              </li>
            </ul>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Creating Fake Testimonials:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ mb: 2, pl: 2 }}>
            <ul>
              <li>
                User ID is required (get this from the created fake profile
                response)
              </li>
              <li>Rating must be between 1-5 stars</li>
              <li>Testimonial text is optional but recommended</li>
              <li>
                Auto-approve will make the testimonial visible immediately on
                the Pricing page
              </li>
            </ul>
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            <strong>Creating Fake Subscriptions:</strong>
          </Typography>
          <Typography variant="body2" component="div" sx={{ pl: 2 }}>
            <ul>
              <li>
                User ID is required (get this from the created fake profile
                response)
              </li>
              <li>Plan must be either Silver or Gold</li>
              <li>Amount is automatically calculated based on user category</li>
              <li>
                Duration defaults to 30 days but can be customized (1-365 days)
              </li>
              <li>
                Subscription will be immediately active and badges will be
                synced automatically
              </li>
              <li>Regular users: Silver = KES 149, Gold = KES 249</li>
              <li>Premium users: Silver = KES 199, Gold = KES 349</li>
            </ul>
          </Typography>
        </CardContent>
      </Card>

      <Stack spacing={3}>
        {/* Create Fake Profile Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <PersonAdd sx={{ color: "#D4AF37", fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Create Fake Profile
              </Typography>
            </Box>

            <Stack spacing={2}>
              <TextField
                label="Name *"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                fullWidth
                required
              />
              <TextField
                label="Username *"
                name="username"
                value={profileForm.username}
                onChange={handleProfileChange}
                fullWidth
                required
              />
              <TextField
                label="Email *"
                name="email"
                type="email"
                value={profileForm.email}
                onChange={handleProfileChange}
                fullWidth
                required
              />
              <TextField
                label="Phone"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                fullWidth
                placeholder="+254700000000"
                helperText="Optional - defaults to fake number if not provided"
              />
              <TextField
                label="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={profileForm.password}
                onChange={handleProfileChange}
                fullWidth
                helperText="Optional - random password generated if not provided"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select
                  name="gender"
                  value={profileForm.gender}
                  onChange={handleProfileChange}
                  label="Gender"
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Category *</InputLabel>
                <Select
                  name="category"
                  value={profileForm.category}
                  onChange={handleProfileChange}
                  label="Category *"
                >
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Sugar Mummy">Sugar Mummy</MenuItem>
                  <MenuItem value="Sponsor">Sponsor</MenuItem>
                  <MenuItem value="Ben 10">Ben 10</MenuItem>
                  <MenuItem value="Urban Chics">Urban Chics</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="County"
                name="county"
                value={profileForm.county}
                onChange={handleProfileChange}
                fullWidth
              />
              <TextField
                label="Bio"
                name="bio"
                value={profileForm.bio}
                onChange={handleProfileChange}
                fullWidth
                multiline
                rows={3}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Birth Year"
                    name="birth_year"
                    type="number"
                    value={profileForm.birth_year}
                    onChange={handleProfileChange}
                    fullWidth
                    inputProps={{ min: 1900, max: new Date().getFullYear() }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Age"
                    name="age"
                    type="number"
                    value={profileForm.age}
                    onChange={handleProfileChange}
                    fullWidth
                    inputProps={{ min: 18, max: 120 }}
                    helperText="Alternative to birth year"
                  />
                </Grid>
              </Grid>
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                  Profile Image * (Required)
                </Typography>
                <input
                  accept="image/*"
                  type="file"
                  id="profile-image-upload"
                  style={{ display: "none" }}
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    fullWidth
                    sx={{
                      borderColor: profileImage
                        ? "#4CAF50"
                        : "rgba(0, 0, 0, 0.23)",
                      color: profileImage ? "#4CAF50" : "rgba(0, 0, 0, 0.6)",
                      "&:hover": {
                        borderColor: profileImage ? "#4CAF50" : "#D4AF37",
                        backgroundColor: profileImage
                          ? "rgba(76, 175, 80, 0.05)"
                          : "rgba(212, 175, 55, 0.05)",
                      },
                    }}
                  >
                    {profileImage ? profileImage.name : "Choose Profile Image"}
                  </Button>
                </label>
                {profileImagePreview && (
                  <Box
                    sx={{
                      mt: 2,
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      src={profileImagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    label="Latitude"
                    name="latitude"
                    type="number"
                    value={profileForm.latitude}
                    onChange={handleProfileChange}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Longitude"
                    name="longitude"
                    type="number"
                    value={profileForm.longitude}
                    onChange={handleProfileChange}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Chip
                  label={profileForm.isVerified ? "Verified" : "Not Verified"}
                  color={profileForm.isVerified ? "success" : "default"}
                  onClick={() =>
                    setProfileForm((prev) => ({
                      ...prev,
                      isVerified: !prev.isVerified,
                    }))
                  }
                  sx={{ cursor: "pointer" }}
                />
                <Chip
                  label={
                    profileForm.autoApprove ? "Auto-Approve" : "Manual Approval"
                  }
                  color={profileForm.autoApprove ? "primary" : "default"}
                  onClick={() =>
                    setProfileForm((prev) => ({
                      ...prev,
                      autoApprove: !prev.autoApprove,
                    }))
                  }
                  sx={{ cursor: "pointer" }}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateFakeProfile}
                disabled={loading}
                startIcon={
                  loading ? <CircularProgress size={20} /> : <PersonAdd />
                }
                sx={{
                  bgcolor: "#D4AF37",
                  "&:hover": { bgcolor: "#B8941F" },
                  py: 1.5,
                }}
              >
                {loading ? "Creating..." : "Create Fake Profile"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Create Fake Testimonial Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <RateReview sx={{ color: "#D4AF37", fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Create Fake Testimonial
              </Typography>
            </Box>

            <Stack spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Select User *</InputLabel>
                <Select
                  value={testimonialForm.public_user_id || ""}
                  onChange={(e) => {
                    setTestimonialForm((prev) => ({
                      ...prev,
                      public_user_id: e.target.value,
                    }));
                  }}
                  label="Select User *"
                  disabled={loadingUsers}
                >
                  {loadingUsers ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading users...
                    </MenuItem>
                  ) : users.length === 0 ? (
                    <MenuItem disabled>No users available</MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {user.photo && (
                            <Avatar
                              src={`/uploads/${user.photo}`}
                              sx={{ width: 24, height: 24 }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2">
                              {user.name || "Unknown"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {testimonialForm.public_user_id && (
                <Chip
                  label={`Selected: ${testimonialForm.public_user_id}`}
                  onDelete={() => {
                    setTestimonialForm((prev) => ({
                      ...prev,
                      public_user_id: "",
                    }));
                  }}
                  color="primary"
                  size="small"
                />
              )}
              <FormControl fullWidth>
                <InputLabel>Rating *</InputLabel>
                <Select
                  name="rating"
                  value={testimonialForm.rating}
                  onChange={handleTestimonialChange}
                  label="Rating *"
                >
                  <MenuItem value={1}>1 Star</MenuItem>
                  <MenuItem value={2}>2 Stars</MenuItem>
                  <MenuItem value={3}>3 Stars</MenuItem>
                  <MenuItem value={4}>4 Stars</MenuItem>
                  <MenuItem value={5}>5 Stars</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Testimonial Text"
                name="testimonial"
                value={testimonialForm.testimonial}
                onChange={handleTestimonialChange}
                fullWidth
                multiline
                rows={4}
                placeholder="Enter testimonial text here..."
              />
              <Box>
                <Chip
                  label={
                    testimonialForm.autoApprove
                      ? "Auto-Approve"
                      : "Manual Approval"
                  }
                  color={testimonialForm.autoApprove ? "primary" : "default"}
                  onClick={() =>
                    setTestimonialForm((prev) => ({
                      ...prev,
                      autoApprove: !prev.autoApprove,
                    }))
                  }
                  sx={{ cursor: "pointer" }}
                />
              </Box>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateFakeTestimonial}
                disabled={testimonialLoading}
                startIcon={
                  testimonialLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <RateReview />
                  )
                }
                sx={{
                  bgcolor: "#D4AF37",
                  "&:hover": { bgcolor: "#B8941F" },
                  py: 1.5,
                }}
              >
                {testimonialLoading ? "Creating..." : "Create Fake Testimonial"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Create Fake Subscription Section */}
        <Card>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
              <AttachMoney sx={{ color: "#D4AF37", fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                Create Fake Subscription
              </Typography>
            </Box>

            <Stack spacing={2}>
              <FormControl fullWidth required>
                <InputLabel>Select User *</InputLabel>
                <Select
                  value={subscriptionForm.public_user_id || ""}
                  onChange={(e) => {
                    setSubscriptionForm((prev) => ({
                      ...prev,
                      public_user_id: e.target.value,
                    }));
                  }}
                  label="Select User *"
                  disabled={loadingUsers}
                >
                  {loadingUsers ? (
                    <MenuItem disabled>
                      <CircularProgress size={20} sx={{ mr: 1 }} />
                      Loading users...
                    </MenuItem>
                  ) : users.length === 0 ? (
                    <MenuItem disabled>No users available</MenuItem>
                  ) : (
                    users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {user.photo && (
                            <Avatar
                              src={`/uploads/${user.photo}`}
                              sx={{ width: 24, height: 24 }}
                            />
                          )}
                          <Box>
                            <Typography variant="body2">
                              {user.name || "Unknown"}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
              {subscriptionForm.public_user_id && (
                <Chip
                  label={`Selected: ${subscriptionForm.public_user_id}`}
                  onDelete={() => {
                    setSubscriptionForm((prev) => ({
                      ...prev,
                      public_user_id: "",
                    }));
                  }}
                  color="primary"
                  size="small"
                />
              )}
              <FormControl fullWidth>
                <InputLabel>Plan *</InputLabel>
                <Select
                  name="plan"
                  value={subscriptionForm.plan}
                  onChange={handleSubscriptionChange}
                  label="Plan *"
                >
                  <MenuItem value="Silver">Silver</MenuItem>
                  <MenuItem value="Gold">Gold</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Duration (Days)"
                name="duration_days"
                type="number"
                value={subscriptionForm.duration_days}
                onChange={handleSubscriptionChange}
                fullWidth
                inputProps={{ min: 1, max: 365 }}
                helperText="Subscription duration in days (default: 30)"
              />
              <Typography
                variant="body2"
                sx={{ color: "text.secondary", fontSize: "0.875rem" }}
              >
                <strong>Note:</strong> Amount will be automatically calculated
                based on user category:
                <br />• Regular users: Silver = KES 149, Gold = KES 249
                <br />• Premium users: Silver = KES 199, Gold = KES 349
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={handleCreateFakeSubscription}
                disabled={subscriptionLoading}
                startIcon={
                  subscriptionLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <AttachMoney />
                  )
                }
                sx={{
                  bgcolor: "#D4AF37",
                  "&:hover": { bgcolor: "#B8941F" },
                  py: 1.5,
                }}
              >
                {subscriptionLoading
                  ? "Creating..."
                  : "Create Fake Subscription"}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
}
