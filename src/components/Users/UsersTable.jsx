import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Divider,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Avatar,
  InputAdornment,
  Tabs,
  Tab,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Visibility as ViewIcon,
  Visibility as Visibility,
  VisibilityOff as VisibilityOff,
  AdminPanelSettings as AdminIcon,
  CheckCircle,
  Wc as GenderIcon,
  CalendarToday as AgeIcon,
  Description as BioIcon,
  Circle as OnlineIcon,
  AccountBalanceWallet as WalletIcon,
  Star as FeaturedIcon,
  TrendingUp as BoostIcon,
  Verified as VerifiedIcon,
  AccessTime as LastSeenIcon,
  Pending as PendingIcon,
  Cancel as CancelIcon,
  CheckCircle as ApproveIcon,
  ThumbUp as ThumbUpIcon,
  ThumbDown as ThumbDownIcon,
  PhotoCamera as PhotoIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";
import Swal from "sweetalert2";

const UsersTable = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Helper to build URL for uploaded assets using Vite proxy
  const buildImageUrl = (imageUrl) => {
    if (!imageUrl) return "";
    if (imageUrl.startsWith("http")) return imageUrl;

    // Use relative URLs - Vite proxy will handle routing to backend
    if (imageUrl.startsWith("uploads/")) return `/${imageUrl}`;
    if (imageUrl.startsWith("/uploads/")) return imageUrl;
    // Handle public users photo path (e.g., "profiles/filename.png")
    if (imageUrl.startsWith("profiles/")) return `/uploads/${imageUrl}`;
    return imageUrl;
  };

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingView, setLoadingView] = useState(false);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [moderationLoading, setModerationLoading] = useState({});
  const [userForm, setUserForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    role: "moderator",
    password: "",
  });

  // User type tabs configuration
  const userTypeTabs = [
    { label: "Admin Users", value: "admin", endpoint: "/api/admin-users" },
    {
      label: "Public Users",
      value: "public",
      endpoint: "/api/admin-users/public-users",
    },
  ];

  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, activeTab, categoryFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
      });

      // Add category filter for public users
      if (activeTab === 1 && categoryFilter) {
        queryParams.append("category", categoryFilter);
      }

      // Get the appropriate endpoint based on the selected tab
      const selectedTab = userTypeTabs[activeTab];
      const endpoint = selectedTab?.endpoint || "/api/admin-users";

      const response = await fetch(`${endpoint}?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data || []);
        setTotalUsers(data.pagination?.total || 0);
      } else {
        setError("Failed to fetch users: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      setError("Error fetching users: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin":
      case "super-admin":
        return "error";
      case "admin":
        return "primary";
      case "moderator":
        return "info";
      case "regular user":
        return "secondary";
      default:
        return "default";
    }
  };

  const formatRole = (role) => {
    if (!role) return "N/A";
    return role
      .replace("-", " ")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

const displayValue = (value, fallback = "Not provided") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : fallback;
  }
  return value;
};

  const getStatusColor = (isActive) => {
    return isActive ? "success" : "error";
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (
      parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
    ).toUpperCase();
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setPage(0); // Reset to first page when switching tabs
    setCategoryFilter(""); // Reset category filter when switching tabs
  };

  const handleViewUser = async (user) => {
    // For public users, fetch full details from API
    if (userTypeTabs[activeTab]?.value === "public") {
      try {
        setLoadingView(true);
        const token = localStorage.getItem("token");
        const response = await fetch(
          `/api/admin-users/public-users/${user.id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success) {
          setSelectedUser(data.data);
        } else {
          setSelectedUser(user); // Fallback to original user data
        }
      } catch (err) {
        console.error("Error fetching user details:", err);
        setSelectedUser(user); // Fallback to original user data
      } finally {
        setLoadingView(false);
      }
    } else {
      setSelectedUser(user);
    }
    setOpenViewDialog(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);

    setUserForm({
      full_name: user.full_name || user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      role: user.role || "moderator",
      password: "",
    });
    setOpenEditDialog(true);
  };

  const handleDeleteUser = async (user) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Do you want to delete "${user.full_name || user.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      try {
        setIsDeleting(true);
        const token = localStorage.getItem("token");

        if (!token) {
          setError("No authentication token found. Please login again.");
          return;
        }

        const response = await fetch(`/api/admin-users/${user.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to delete user");
        }

        fetchUsers();

        Swal.fire({
          icon: "success",
          title: "Deleted!",
          text: "User has been deleted successfully.",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error("Error deleting user:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to delete user. Please try again.",
        });
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleUpdateUser = async () => {
    try {
      setIsUpdating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      // Send only fields that the API accepts
      const updateData = {
        name: userForm.full_name,
        email: userForm.email,
        phone: userForm.phone,
        role: userForm.role,
      };

      const response = await fetch(`/api/admin-users/${selectedUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update user");
      }

      setUserForm({
        full_name: "",
        email: "",
        phone: "",
        role: "moderator",
        password: "",
      });
      setOpenEditDialog(false);
      setSelectedUser(null);

      fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Updated!",
        text: "User has been updated successfully.",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error updating user:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to update user. Please try again.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Moderation handlers
  const handleModeration = async (userId, type, action, notes = "") => {
    try {
      const key = `${userId}-${type}`;
      setModerationLoading((prev) => ({ ...prev, [key]: true }));
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No authentication token found.",
        });
        return;
      }

      const response = await fetch(
        `/api/moderation/${type}/${userId}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Moderation action failed");
      }

      // Refresh user data
      if (selectedUser?.id === userId) {
        const refreshResponse = await fetch(
          `/api/admin-users/public-users/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setSelectedUser(refreshData.data);
        }
      }

      // Refresh users list
      fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `${type === "photo" ? "Photo" : "Bio"} ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Moderation error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to perform moderation action.",
      });
    } finally {
      const key = `${userId}-${type}`;
      setModerationLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  // Gallery photo moderation handler
  const handleGalleryPhotoModeration = async (
    userId,
    photoIndex,
    action,
    notes = ""
  ) => {
    try {
      const key = `${userId}-gallery-${photoIndex}`;
      setModerationLoading((prev) => ({ ...prev, [key]: true }));
      const token = localStorage.getItem("token");

      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No authentication token found.",
        });
        return;
      }

      const response = await fetch(
        `/api/moderation/gallery-photo/${userId}/${photoIndex}/${action}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ notes }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Moderation action failed");
      }

      // Refresh user data
      if (selectedUser?.id === userId) {
        const refreshResponse = await fetch(
          `/api/admin-users/public-users/${userId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const refreshData = await refreshResponse.json();
        if (refreshData.success) {
          setSelectedUser(refreshData.data);
        }
      }

      // Refresh users list
      fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: `Gallery photo ${
          action === "approve" ? "approved" : "rejected"
        } successfully.`,
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Gallery photo moderation error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message || "Failed to perform moderation action.",
      });
    } finally {
      const key = `${userId}-gallery-${photoIndex}`;
      setModerationLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const handleCreateUser = async () => {
    try {
      setIsCreating(true);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      // Send only fields that the API accepts
      const createData = {
        name: userForm.full_name,
        email: userForm.email,
        password: userForm.password,
        phone: userForm.phone,
        role: userForm.role,
      };

      const response = await fetch("/api/admin-users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create user");
      }

      setUserForm({
        full_name: "",
        email: "",
        phone: "",
        role: "moderator",
        password: "",
      });
      setOpenCreateDialog(false);
      setSelectedUser(null);

      fetchUsers();

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: "User created successfully!",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error creating user:", err);
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: err.message || "Failed to create user. Please try again.",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Box
      sx={{
        background: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          overflow: "hidden",
          background: "#ffffff",
          border: "none",
          boxShadow: "none",
          minHeight: "100vh",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background:
              "linear-gradient(135deg, #ffffff 0%, #fef5e7 50%, #fff9e6 100%)",
            p: { xs: 2, sm: 3 },
            color: "#2c3e50",
            position: "relative",
            overflow: "hidden",
            borderBottom: "2px solid #FFD700",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 215, 0, 0.08)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -30,
              width: 150,
              height: 150,
              background: "rgba(255, 182, 193, 0.06)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box
            display="flex"
            flexDirection={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            gap={{ xs: 2, sm: 0 }}
            position="relative"
            zIndex={1}
          >
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 600,
                  mb: { xs: 0.5, sm: 1 },
                  color: "#2c3e50",
                  fontSize: { xs: "1.25rem", sm: "1.75rem", md: "2.125rem" },
                }}
              >
                Tuvibe Users Management
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: "#7f8c8d",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                Manage users and their roles
              </Typography>
            </Box>
            {userTypeTabs[activeTab]?.value === "admin" && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => {
                  setSelectedUser(null);
                  setShowPassword(false);
                  setUserForm({
                    full_name: "",
                    email: "",
                    phone: "",
                    role: "moderator",
                    password: "",
                  });
                  setOpenCreateDialog(true);
                }}
                sx={{
                  background: "#FFD700",
                  borderRadius: 3,
                  px: { xs: 2, sm: 4 },
                  py: 1.5,
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: 600,
                  color: "#2c3e50",
                  textTransform: "none",
                  boxShadow: "0 4px 12px rgba(255, 215, 0, 0.25)",
                  width: { xs: "100%", sm: "auto" },
                  "&:hover": {
                    background: "#FFC700",
                    transform: "translateY(-2px)",
                    boxShadow: "0 6px 18px rgba(255, 215, 0, 0.35)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Create New Admin
              </Button>
            )}
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: "calc(100vh - 200px)" }}
        >
          {/* Tabs */}
          <Box mb={{ xs: 2, sm: 3 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              allowScrollButtonsMobile
              sx={{
                "& .MuiTabs-scrollButtons": {
                  "&.Mui-disabled": { opacity: 0.3 },
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: { xs: "0.75rem", sm: "0.875rem", md: "1rem" },
                  minHeight: { xs: 40, sm: 48 },
                  px: { xs: 1, sm: 2 },
                  color: "#7f8c8d",
                  "&.Mui-selected": {
                    color: "#FFD700",
                    fontWeight: 700,
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#FFD700",
                  height: 3,
                  borderRadius: "2px 2px 0 0",
                },
              }}
            >
              {userTypeTabs.map((tab, index) => (
                <Tab key={index} label={tab.label} />
              ))}
            </Tabs>
          </Box>

          {/* Category Filter - Only for Public Users */}
          {userTypeTabs[activeTab]?.value === "public" && (
            <Box mb={3}>
              <FormControl
                variant="outlined"
                size="small"
                sx={{
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#ffffff",
                    border: "1px solid rgba(255, 215, 0, 0.3)",
                    "&:hover fieldset": {
                      borderColor: "rgba(255, 215, 0, 0.5)",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#FFD700",
                    },
                  },
                }}
              >
                <InputLabel
                  sx={{
                    color: "#7f8c8d",
                    fontWeight: 600,
                  }}
                >
                  Filter by Category
                </InputLabel>
                <Select
                  value={categoryFilter}
                  onChange={(e) => {
                    setCategoryFilter(e.target.value);
                    setPage(0); // Reset to first page when filter changes
                  }}
                  label="Filter by Category"
                  sx={{
                    color: "#2c3e50",
                    fontWeight: 600,
                    "& .MuiSelect-icon": {
                      color: "#FFD700",
                    },
                  }}
                >
                  <MenuItem value="">
                    <em>All Categories</em>
                  </MenuItem>
                  <MenuItem value="Regular">Regular</MenuItem>
                  <MenuItem value="Sugar Mummy">Sugar Mummy</MenuItem>
                  <MenuItem value="Sponsor">Sponsor</MenuItem>
                  <MenuItem value="Ben 10">Ben 10</MenuItem>
                </Select>
              </FormControl>
            </Box>
          )}

          {/* Users Table */}
          <TableContainer
            sx={{
              borderRadius: 3,
              overflowX: "auto",
              backgroundColor: "#ffffff",
              border: "1px solid rgba(255, 215, 0, 0.2)",
              "&::-webkit-scrollbar": {
                height: 8,
              },
              "&::-webkit-scrollbar-track": {
                backgroundColor: "rgba(255, 182, 193, 0.1)",
                borderRadius: 4,
              },
              "&::-webkit-scrollbar-thumb": {
                backgroundColor: "rgba(255, 215, 0, 0.3)",
                borderRadius: 4,
                "&:hover": {
                  backgroundColor: "rgba(255, 215, 0, 0.5)",
                },
              },
            }}
          >
            <Table sx={{ minWidth: { xs: 400, sm: 600 } }}>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #fff9e6 50%, #fef5e7 100%)",
                    borderBottom: "2px solid #FFD700",
                    "& .MuiTableCell-head": {
                      color: "#2c3e50",
                      fontWeight: 700,
                      fontSize: { xs: "0.7rem", sm: "0.85rem", md: "0.95rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      border: "none",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell sx={{ width: { xs: "60px", sm: "80px" } }}>
                    No
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>
                    Email
                  </TableCell>
                  {userTypeTabs[activeTab]?.value === "admin" ? (
                    <>
                      <TableCell
                        sx={{ display: { xs: "none", lg: "table-cell" } }}
                      >
                        Phone
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        Role
                      </TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell
                        sx={{ display: { xs: "none", lg: "table-cell" } }}
                      >
                        County
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        Category
                      </TableCell>
                    </>
                  )}
                  {userTypeTabs[activeTab]?.value === "public" && (
                    <TableCell
                      sx={{ display: { xs: "none", sm: "table-cell" } }}
                    >
                      Status
                    </TableCell>
                  )}
                  <TableCell
                    align="center"
                    sx={{ width: { xs: "100px", sm: "auto" } }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        userTypeTabs[activeTab]?.value === "admin" ? 6 : 7
                      }
                      align="center"
                      sx={{ py: 4 }}
                    >
                      <CircularProgress sx={{ color: "#FFD700" }} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        userTypeTabs[activeTab]?.value === "admin" ? 6 : 7
                      }
                      align="center"
                      sx={{ py: 4 }}
                    >
                      <Typography color="error" variant="h6">
                        {error}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={
                        userTypeTabs[activeTab]?.value === "admin" ? 6 : 7
                      }
                      align="center"
                      sx={{ py: 4 }}
                    >
                      <Typography variant="h6" color="text.secondary">
                        No users found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user, idx) => (
                    <TableRow
                      key={user.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "rgba(255, 215, 0, 0.03)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(255, 215, 0, 0.08)",
                          transform: { xs: "none", sm: "scale(1.01)" },
                        },
                        transition: "all 0.2s ease",
                        cursor: "pointer",
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          padding: { xs: "8px 4px", sm: "16px" },
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#FFD700" }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          }}
                        >
                          {page * rowsPerPage + idx + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight="600"
                            sx={{
                              color: "#2c3e50",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {user.full_name || user.name || "N/A"}
                          </Typography>
                          {/* Show email on mobile below name */}
                          <Typography
                            variant="caption"
                            sx={{
                              color: "#7f8c8d",
                              fontSize: { xs: "0.65rem", sm: "0.75rem" },
                              display: { xs: "block", md: "none" },
                              mt: 0.5,
                            }}
                          >
                            {user.email}
                          </Typography>
                          {/* Show status on mobile below name - only for public users */}
                          {userTypeTabs[activeTab]?.value === "public" && (
                            <Box
                              sx={{
                                display: { xs: "flex", sm: "none" },
                                mt: 0.5,
                                gap: 0.5,
                              }}
                            >
                              <Chip
                                label={
                                  user.isActive !== undefined
                                    ? user.isActive
                                      ? "Active"
                                      : "Inactive"
                                    : user.isVerified
                                    ? "Verified"
                                    : "Not Verified"
                                }
                                size="small"
                                variant="outlined"
                                sx={{
                                  fontSize: "0.6rem",
                                  height: 18,
                                  textTransform: "capitalize",
                                  fontWeight: 600,
                                  borderRadius: 1,
                                  ...(user.isActive !== undefined
                                    ? {
                                        borderColor: user.isActive
                                          ? "#90EE90"
                                          : "#FFB6C1",
                                        color: user.isActive
                                          ? "#2d8659"
                                          : "#b85050",
                                        backgroundColor: user.isActive
                                          ? "rgba(144, 238, 144, 0.1)"
                                          : "rgba(255, 182, 193, 0.1)",
                                      }
                                    : user.isVerified
                                    ? {
                                        borderColor: "#FFD700",
                                        color: "#b8860b",
                                        backgroundColor:
                                          "rgba(255, 215, 0, 0.1)",
                                      }
                                    : {
                                        borderColor: "#B0E0E6",
                                        color: "#5a8a93",
                                        backgroundColor:
                                          "rgba(176, 224, 230, 0.1)",
                                      }),
                                  "& .MuiChip-label": {
                                    px: 0.5,
                                  },
                                }}
                              />
                              {/* Show category on mobile if available */}
                              {user.category && (
                                <Chip
                                  label={user.category}
                                  color="info"
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: "0.6rem",
                                    height: 18,
                                    textTransform: "capitalize",
                                    fontWeight: 600,
                                    borderRadius: 1,
                                    "& .MuiChip-label": {
                                      px: 0.5,
                                    },
                                  }}
                                />
                              )}
                            </Box>
                          )}
                          {/* Show role on mobile for admin users */}
                          {userTypeTabs[activeTab]?.value === "admin" &&
                            user.role && (
                              <Box
                                sx={{
                                  display: { xs: "flex", sm: "none" },
                                  mt: 0.5,
                                  gap: 0.5,
                                }}
                              >
                                <Chip
                                  label={formatRole(user.role)}
                                  color={getRoleColor(user.role)}
                                  size="small"
                                  variant="outlined"
                                  sx={{
                                    fontSize: "0.6rem",
                                    height: 18,
                                    fontWeight: 600,
                                    borderRadius: 1,
                                    "& .MuiChip-label": {
                                      px: 0.5,
                                    },
                                  }}
                                />
                              </Box>
                            )}
                        </Box>
                      </TableCell>
                      <TableCell
                        sx={{ display: { xs: "none", md: "table-cell" } }}
                      >
                        <Typography variant="body2" sx={{ color: "#7f8c8d" }}>
                          {user.email}
                        </Typography>
                      </TableCell>
                      {userTypeTabs[activeTab]?.value === "admin" ? (
                        <>
                          <TableCell
                            sx={{ display: { xs: "none", lg: "table-cell" } }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#7f8c8d",
                                fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              }}
                            >
                              {user.phone || "N/A"}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: "none", md: "table-cell" } }}
                          >
                            <Chip
                              label={formatRole(user.role)}
                              color={getRoleColor(user.role)}
                              size="small"
                              variant="outlined"
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: 600,
                                borderRadius: 2,
                                fontSize: { xs: "0.7rem", sm: "0.875rem" },
                              }}
                            />
                          </TableCell>
                        </>
                      ) : (
                        <>
                          <TableCell
                            sx={{ display: { xs: "none", lg: "table-cell" } }}
                          >
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#7f8c8d",
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                            }}
                          >
                            {displayValue(user.county)}
                          </Typography>
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: "none", md: "table-cell" } }}
                          >
                            <Chip
                              label={user.category || "N/A"}
                              color="info"
                              size="small"
                              variant="outlined"
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: 600,
                                borderRadius: 2,
                                fontSize: { xs: "0.7rem", sm: "0.875rem" },
                              }}
                            />
                          </TableCell>
                        </>
                      )}
                      {userTypeTabs[activeTab]?.value === "public" && (
                        <TableCell
                          sx={{ display: { xs: "none", sm: "table-cell" } }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Chip
                              label={
                                user.isActive !== undefined
                                  ? user.isActive
                                    ? "Active"
                                    : "Inactive"
                                  : user.isVerified
                                  ? "Verified"
                                  : "Not Verified"
                              }
                              size="small"
                              variant="outlined"
                              sx={{
                                textTransform: "capitalize",
                                fontWeight: 600,
                                borderRadius: 2,
                                fontSize: { xs: "0.7rem", sm: "0.875rem" },
                                ...(user.isActive !== undefined
                                  ? {
                                      borderColor: user.isActive
                                        ? "#90EE90"
                                        : "#FFB6C1",
                                      color: user.isActive
                                        ? "#2d8659"
                                        : "#b85050",
                                      backgroundColor: user.isActive
                                        ? "rgba(144, 238, 144, 0.1)"
                                        : "rgba(255, 182, 193, 0.1)",
                                    }
                                  : user.isVerified
                                  ? {
                                      borderColor: "#FFD700",
                                      color: "#b8860b",
                                      backgroundColor: "rgba(255, 215, 0, 0.1)",
                                    }
                                  : {
                                      borderColor: "#B0E0E6",
                                      color: "#5a8a93",
                                      backgroundColor:
                                        "rgba(176, 224, 230, 0.1)",
                                    }),
                              }}
                            />
                            {/* Moderation Status Indicators */}
                            <Box
                              sx={{
                                display: "flex",
                                gap: 0.5,
                                flexWrap: "wrap",
                              }}
                            >
                              {(() => {
                                // Check if profile picture is pending
                                const profilePhotoPending = user.photo_moderation_status === "pending";
                                
                                // Check if any gallery photo is pending
                                const hasGalleryPhotosPending = 
                                  user.photos && 
                                  Array.isArray(user.photos) && 
                                  user.photos.some(photo => photo.moderation_status === "pending");
                                
                                // Show chip if either profile photo or any gallery photo is pending
                                return (profilePhotoPending || hasGalleryPhotosPending) ? (
                                  <Chip
                                    icon={
                                      <PendingIcon
                                        sx={{ fontSize: "0.75rem !important" }}
                                      />
                                    }
                                    label="Photo Pending"
                                    size="small"
                                    sx={{
                                      fontSize: "0.65rem",
                                      height: "20px",
                                      bgcolor: "rgba(255, 193, 7, 0.2)",
                                      color: "#B8860B",
                                      fontWeight: 600,
                                      border: "1px solid rgba(255, 193, 7, 0.4)",
                                    }}
                                  />
                                ) : null;
                              })()}
                              {user.bio_moderation_status === "pending" && (
                                <Chip
                                  icon={
                                    <PendingIcon
                                      sx={{ fontSize: "0.75rem !important" }}
                                    />
                                  }
                                  label="Bio Pending"
                                  size="small"
                                  sx={{
                                    fontSize: "0.65rem",
                                    height: "20px",
                                    bgcolor: "rgba(255, 193, 7, 0.2)",
                                    color: "#B8860B",
                                    fontWeight: 600,
                                    border: "1px solid rgba(255, 193, 7, 0.4)",
                                  }}
                                />
                              )}
                            </Box>
                          </Box>
                        </TableCell>
                      )}
                      <TableCell align="center">
                        <Box display="flex" gap={0.5} justifyContent="center">
                          <Tooltip title="View User Details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewUser(user)}
                              sx={{
                                color: "#5a8a93",
                                backgroundColor: "rgba(176, 224, 230, 0.15)",
                                width: { xs: 28, sm: 36 },
                                height: { xs: 28, sm: 36 },
                                "&:hover": {
                                  backgroundColor: "rgba(176, 224, 230, 0.25)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <ViewIcon
                                fontSize={isMobile ? "small" : "small"}
                              />
                            </IconButton>
                          </Tooltip>
                          {userTypeTabs[activeTab]?.value === "admin" && (
                            <>
                              <Tooltip title="Edit User" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleEditUser(user)}
                                  sx={{
                                    color: "#b8860b",
                                    backgroundColor: "rgba(255, 215, 0, 0.15)",
                                    width: { xs: 28, sm: 36 },
                                    height: { xs: 28, sm: 36 },
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(255, 215, 0, 0.25)",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease",
                                    borderRadius: 2,
                                  }}
                                >
                                  <EditIcon
                                    fontSize={isMobile ? "small" : "small"}
                                  />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => handleDeleteUser(user)}
                                  sx={{
                                    color: "#b85050",
                                    backgroundColor:
                                      "rgba(255, 182, 193, 0.15)",
                                    width: { xs: 28, sm: 36 },
                                    height: { xs: 28, sm: 36 },
                                    "&:hover": {
                                      backgroundColor:
                                        "rgba(255, 182, 193, 0.25)",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease",
                                    borderRadius: 2,
                                  }}
                                >
                                  <DeleteIcon
                                    fontSize={isMobile ? "small" : "small"}
                                  />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              backgroundColor: "#ffffff",
              borderTop: "1px solid rgba(255, 215, 0, 0.2)",
              "& .MuiTablePagination-toolbar": {
                color: "#FFD700",
                fontWeight: 600,
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
                {
                  color: "#2c3e50",
                  fontWeight: 600,
                },
            }}
          />
        </Box>

        {/* User Dialog */}
        <Dialog
          open={openViewDialog || openEditDialog || openCreateDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setOpenEditDialog(false);
            setOpenCreateDialog(false);
            setSelectedUser(null);
            setShowPassword(false);
            setLoadingView(false);
            setUserForm({
              full_name: "",
              email: "",
              phone: "",
              role: "moderator",
              password: "",
            });
          }}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: { xs: 2, sm: 4 },
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              m: { xs: 2, sm: 2 },
              maxWidth: { xs: "calc(100% - 16px)", sm: "600px" },
              maxHeight: { xs: "calc(100vh - 32px)", sm: "85vh" },
              width: "100%",
              background: "#ffffff",
              border: "2px solid rgba(255, 215, 0, 0.3)",
              overflow: "hidden",
            },
            "& .MuiBackdrop-root": {
              backgroundColor: "rgba(0, 0, 0, 0.4)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background:
                "linear-gradient(135deg, #ffffff 0%, #fff9e6 50%, #fef5e7 100%)",
              color: "#2c3e50",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
              position: "relative",
              overflow: "hidden",
              borderBottom: "2px solid #FFD700",
            }}
          >
            <Box
              sx={{
                position: "absolute",
                top: -20,
                right: -20,
                width: 100,
                height: 100,
                background: "rgba(255, 215, 0, 0.08)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <AdminIcon
              sx={{
                position: "relative",
                zIndex: 1,
                fontSize: { xs: 20, sm: 28 },
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 700,
                  color: "#2c3e50",
                  fontSize: { xs: "1rem", sm: "1.5rem" },
                }}
              >
                {openViewDialog
                  ? "User Details"
                  : openEditDialog
                  ? "Edit User"
                  : "Create New Admin"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  opacity: 0.9,
                  mt: 0.5,
                  fontSize: { xs: "0.75rem", sm: "0.875rem" },
                  display: { xs: "none", sm: "block" },
                }}
              >
                {openViewDialog
                  ? "View user information"
                  : openEditDialog
                  ? "Update user details"
                  : "Add a new admin to the system"}
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent
            sx={{
              p: { xs: 2, sm: 3 },
              pt: { xs: 2, sm: 3 },
              maxHeight: { xs: "calc(100vh - 250px)", sm: "70vh" },
              overflowY: "auto",
            }}
          >
            {loadingView && userTypeTabs[activeTab]?.value === "public" ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: "200px",
                }}
              >
                <CircularProgress sx={{ color: "#FFD700" }} />
              </Box>
            ) : openViewDialog ? (
              // View User Details
              <Box>
                <Box
                  sx={{
                    background:
                      "linear-gradient(135deg, #ffffff 0%, #fff9e6 50%, #fef5e7 100%)",
                    borderRadius: 3,
                    p: 3,
                    mb: 4,
                    mt: 2,
                    position: "relative",
                    overflow: "hidden",
                    color: "#2c3e50",
                    border: "2px solid rgba(255, 215, 0, 0.3)",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      right: -20,
                      width: 100,
                      height: 100,
                      background: "rgba(255, 215, 0, 0.08)",
                      borderRadius: "50%",
                      zIndex: 0,
                    }}
                  />
                  <Box sx={{ position: "relative", zIndex: 1 }}>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        color: "#2c3e50",
                      }}
                    >
                      {selectedUser?.full_name || selectedUser?.name || "N/A"}
                    </Typography>
                    <Typography
                      variant="body1"
                      sx={{
                        color: "#7f8c8d",
                        lineHeight: 1.6,
                        fontSize: "1rem",
                      }}
                    >
                      {selectedUser?.email}
                    </Typography>
                  </Box>
                </Box>

                {/* Profile Picture Display with Moderation */}
                {(selectedUser?.profile_image || selectedUser?.photo) && (
                  <Box sx={{ textAlign: "center", mb: 3 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                      }}
                    >
                      <Typography
                        variant="h6"
                        sx={{ color: "#2c3e50", fontWeight: 600 }}
                      >
                        Profile Picture
                      </Typography>
                      {/* Photo Moderation Status & Actions */}
                      {userTypeTabs[activeTab]?.value === "public" && (
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          {selectedUser?.photo_moderation_status ===
                            "pending" && (
                            <Chip
                              icon={
                                <PendingIcon
                                  sx={{ fontSize: "0.875rem !important" }}
                                />
                              }
                              label="Pending Approval"
                              size="small"
                              sx={{
                                bgcolor: "rgba(255, 193, 7, 0.2)",
                                color: "#B8860B",
                                fontWeight: 600,
                                border: "1px solid rgba(255, 193, 7, 0.4)",
                              }}
                            />
                          )}
                          {selectedUser?.photo_moderation_status ===
                            "approved" && (
                            <Chip
                              icon={
                                <CheckCircle
                                  sx={{
                                    fontSize: "0.875rem !important",
                                    color: "#4CAF50 !important",
                                  }}
                                />
                              }
                              label="Approved"
                              size="small"
                              sx={{
                                bgcolor: "rgba(76, 175, 80, 0.15)",
                                color: "#2E7D32",
                                fontWeight: 600,
                                border: "1px solid rgba(76, 175, 80, 0.3)",
                              }}
                            />
                          )}
                          {selectedUser?.photo_moderation_status ===
                            "rejected" && (
                            <Chip
                              icon={
                                <CancelIcon
                                  sx={{
                                    fontSize: "0.875rem !important",
                                    color: "#F44336 !important",
                                  }}
                                />
                              }
                              label="Rejected"
                              size="small"
                              sx={{
                                bgcolor: "rgba(244, 67, 54, 0.15)",
                                color: "#C62828",
                                fontWeight: 600,
                                border: "1px solid rgba(244, 67, 54, 0.3)",
                              }}
                            />
                          )}
                          {selectedUser?.photo_moderation_status ===
                            "pending" && (
                            <Box sx={{ display: "flex", gap: 0.5 }}>
                              <Tooltip title="Approve Photo" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    handleModeration(
                                      selectedUser.id,
                                      "photo",
                                      "approve"
                                    )
                                  }
                                  disabled={
                                    moderationLoading[
                                      `${selectedUser.id}-photo`
                                    ]
                                  }
                                  sx={{
                                    bgcolor: "rgba(76, 175, 80, 0.1)",
                                    color: "#4CAF50",
                                    "&:hover": {
                                      bgcolor: "rgba(76, 175, 80, 0.2)",
                                    },
                                  }}
                                >
                                  <ThumbUpIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Photo" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    Swal.fire({
                                      title: "Reject Photo",
                                      input: "textarea",
                                      inputLabel: "Rejection Reason (Optional)",
                                      inputPlaceholder:
                                        "Enter reason for rejection...",
                                      inputAttributes: {
                                        "aria-label": "Enter rejection reason",
                                      },
                                      showCancelButton: true,
                                      confirmButtonColor: "#d33",
                                      cancelButtonColor: "#3085d6",
                                      confirmButtonText: "Reject",
                                      cancelButtonText: "Cancel",
                                    }).then((result) => {
                                      if (result.isConfirmed) {
                                        handleModeration(
                                          selectedUser.id,
                                          "photo",
                                          "reject",
                                          result.value || ""
                                        );
                                      }
                                    });
                                  }}
                                  disabled={
                                    moderationLoading[
                                      `${selectedUser.id}-photo`
                                    ]
                                  }
                                  sx={{
                                    bgcolor: "rgba(244, 67, 54, 0.1)",
                                    color: "#F44336",
                                    "&:hover": {
                                      bgcolor: "rgba(244, 67, 54, 0.2)",
                                    },
                                  }}
                                >
                                  <ThumbDownIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </Box>
                      )}
                    </Box>
                    <Box
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(255, 215, 0, 0.1)",
                        borderRadius: 2,
                        border: "2px solid rgba(255, 215, 0, 0.3)",
                        cursor: "pointer",
                        transition: "transform 0.2s ease-in-out",
                        display: "inline-block",
                        position: "relative",
                        "&:hover": {
                          transform: "scale(1.02)",
                        },
                      }}
                      onClick={() => {
                        const imagePath =
                          selectedUser.profile_image || selectedUser.photo;
                        const fullImageUrl = buildImageUrl(imagePath);
                        window.open(fullImageUrl, "_blank");
                      }}
                    >
                      <Box
                        sx={{ position: "relative", display: "inline-block" }}
                      >
                        <Box
                          component="img"
                          src={buildImageUrl(
                            selectedUser.profile_image || selectedUser.photo
                          )}
                          alt="Profile Picture"
                          sx={{
                            width: 150,
                            height: 150,
                            objectFit: "cover",
                            borderRadius: "50%",
                            border: "4px solid #FFD700",
                            boxShadow: "0 8px 25px rgba(255, 215, 0, 0.25)",
                            opacity:
                              userTypeTabs[activeTab]?.value === "public" &&
                              selectedUser?.photo_moderation_status !==
                                "approved" &&
                              selectedUser?.photo_moderation_status !== null
                                ? 0.7
                                : 1,
                          }}
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "block";
                          }}
                        />
                        {/* Overlay badge for pending/rejected photos (admin view) */}
                        {userTypeTabs[activeTab]?.value === "public" &&
                          selectedUser?.photo_moderation_status ===
                            "pending" && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                bgcolor: "rgba(255, 193, 7, 0.95)",
                                color: "#1a1a1a",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid rgba(184, 134, 11, 0.5)",
                                boxShadow: "0 2px 8px rgba(255, 193, 7, 0.4)",
                              }}
                            >
                              <PendingIcon sx={{ fontSize: "1.2rem" }} />
                            </Box>
                          )}
                        {userTypeTabs[activeTab]?.value === "public" &&
                          selectedUser?.photo_moderation_status ===
                            "rejected" && (
                            <Box
                              sx={{
                                position: "absolute",
                                top: -5,
                                right: -5,
                                bgcolor: "rgba(244, 67, 54, 0.95)",
                                color: "#fff",
                                borderRadius: "50%",
                                width: 32,
                                height: 32,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: "2px solid rgba(198, 40, 40, 0.5)",
                                boxShadow: "0 2px 8px rgba(244, 67, 54, 0.4)",
                              }}
                            >
                              <CancelIcon sx={{ fontSize: "1.2rem" }} />
                            </Box>
                          )}
                      </Box>
                      <Box
                        textAlign="center"
                        sx={{
                          display: "none",
                          width: 150,
                          height: 150,
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "rgba(255, 215, 0, 0.1)",
                          borderRadius: "50%",
                          border: "4px solid #FFD700",
                        }}
                      >
                        <PersonIcon
                          sx={{
                            fontSize: 48,
                            color: "#FFD700",
                            mb: 1,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: "#b8860b",
                            display: "block",
                            wordBreak: "break-word",
                            textAlign: "center",
                          }}
                        >
                          Profile Picture
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                )}

                {/* Gallery Photos Display with Moderation */}
                {userTypeTabs[activeTab]?.value === "public" &&
                  selectedUser?.photos &&
                  Array.isArray(selectedUser.photos) &&
                  selectedUser.photos.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 2,
                        }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ color: "#2c3e50", fontWeight: 600 }}
                        >
                          Gallery Photos ({selectedUser.photos.length})
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "grid",
                          gridTemplateColumns: {
                            xs: "repeat(2, 1fr)",
                            sm: "repeat(3, 1fr)",
                            md: "repeat(4, 1fr)",
                          },
                          gap: 2,
                        }}
                      >
                        {selectedUser.photos.map((photo, index) => {
                          const photoStatus =
                            photo.moderation_status || "pending";
                          const isPending = photoStatus === "pending";
                          const isApproved = photoStatus === "approved";
                          const isRejected = photoStatus === "rejected";
                          const loadingKey = `${selectedUser.id}-gallery-${index}`;
                          const isLoading =
                            moderationLoading[loadingKey] || false;

                          return (
                            <Box
                              key={index}
                              sx={{
                                position: "relative",
                                p: 1.5,
                                backgroundColor: "rgba(255, 215, 0, 0.1)",
                                borderRadius: 2,
                                border: "2px solid rgba(255, 215, 0, 0.3)",
                                transition: "transform 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "scale(1.02)",
                                },
                              }}
                            >
                              {/* Photo Image */}
                              <Box
                                component="img"
                                src={buildImageUrl(photo.path)}
                                alt={`Gallery Photo ${index + 1}`}
                                sx={{
                                  width: "100%",
                                  height: 150,
                                  objectFit: "cover",
                                  borderRadius: 1,
                                  border: "2px solid #FFD700",
                                  cursor: "pointer",
                                  opacity: isPending || isRejected ? 0.7 : 1,
                                  mb: 1,
                                }}
                                onClick={() => {
                                  const fullImageUrl = buildImageUrl(
                                    photo.path
                                  );
                                  window.open(fullImageUrl, "_blank");
                                }}
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />

                              {/* Moderation Status Badge */}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "center",
                                  mb: 1,
                                }}
                              >
                                {isPending && (
                                  <Chip
                                    icon={
                                      <PendingIcon
                                        sx={{ fontSize: "0.75rem !important" }}
                                      />
                                    }
                                    label="Pending"
                                    size="small"
                                    sx={{
                                      fontSize: "0.65rem",
                                      height: "20px",
                                      bgcolor: "rgba(255, 193, 7, 0.2)",
                                      color: "#B8860B",
                                      fontWeight: 600,
                                      border:
                                        "1px solid rgba(255, 193, 7, 0.4)",
                                    }}
                                  />
                                )}
                                {isApproved && (
                                  <Chip
                                    icon={
                                      <CheckCircle
                                        sx={{
                                          fontSize: "0.75rem !important",
                                          color: "#4CAF50 !important",
                                        }}
                                      />
                                    }
                                    label="Approved"
                                    size="small"
                                    sx={{
                                      fontSize: "0.65rem",
                                      height: "20px",
                                      bgcolor: "rgba(76, 175, 80, 0.15)",
                                      color: "#2E7D32",
                                      fontWeight: 600,
                                      border:
                                        "1px solid rgba(76, 175, 80, 0.3)",
                                    }}
                                  />
                                )}
                                {isRejected && (
                                  <Chip
                                    icon={
                                      <CancelIcon
                                        sx={{
                                          fontSize: "0.75rem !important",
                                          color: "#F44336 !important",
                                        }}
                                      />
                                    }
                                    label="Rejected"
                                    size="small"
                                    sx={{
                                      fontSize: "0.65rem",
                                      height: "20px",
                                      bgcolor: "rgba(244, 67, 54, 0.15)",
                                      color: "#C62828",
                                      fontWeight: 600,
                                      border:
                                        "1px solid rgba(244, 67, 54, 0.3)",
                                    }}
                                  />
                                )}
                              </Box>

                              {/* Moderation Actions */}
                              {isPending && (
                                <Box
                                  sx={{
                                    display: "flex",
                                    justifyContent: "center",
                                    gap: 0.5,
                                  }}
                                >
                                  <Tooltip title="Approve Photo" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleGalleryPhotoModeration(
                                          selectedUser.id,
                                          index,
                                          "approve"
                                        )
                                      }
                                      disabled={isLoading}
                                      sx={{
                                        bgcolor: "rgba(76, 175, 80, 0.1)",
                                        color: "#4CAF50",
                                        "&:hover": {
                                          bgcolor: "rgba(76, 175, 80, 0.2)",
                                        },
                                        "&:disabled": {
                                          opacity: 0.5,
                                        },
                                      }}
                                    >
                                      {isLoading ? (
                                        <CircularProgress size={16} />
                                      ) : (
                                        <ThumbUpIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Photo" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        Swal.fire({
                                          title: "Reject Gallery Photo",
                                          input: "textarea",
                                          inputLabel:
                                            "Rejection Reason (Optional)",
                                          inputPlaceholder:
                                            "Enter reason for rejection...",
                                          inputAttributes: {
                                            "aria-label":
                                              "Enter rejection reason",
                                          },
                                          showCancelButton: true,
                                          confirmButtonColor: "#d33",
                                          cancelButtonColor: "#3085d6",
                                          confirmButtonText: "Reject",
                                          cancelButtonText: "Cancel",
                                        }).then((result) => {
                                          if (result.isConfirmed) {
                                            handleGalleryPhotoModeration(
                                              selectedUser.id,
                                              index,
                                              "reject",
                                              result.value || ""
                                            );
                                          }
                                        });
                                      }}
                                      disabled={isLoading}
                                      sx={{
                                        bgcolor: "rgba(244, 67, 54, 0.1)",
                                        color: "#F44336",
                                        "&:hover": {
                                          bgcolor: "rgba(244, 67, 54, 0.2)",
                                        },
                                        "&:disabled": {
                                          opacity: 0.5,
                                        },
                                      }}
                                    >
                                      {isLoading ? (
                                        <CircularProgress size={16} />
                                      ) : (
                                        <ThumbDownIcon fontSize="small" />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    </Box>
                  )}

                <Stack spacing={2} sx={{ mb: 3 }}>
                  {userTypeTabs[activeTab]?.value === "admin" ? (
                    <Card
                      sx={{
                        background: "white",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <PersonIcon sx={{ fontSize: 24, color: "#FFD700" }} />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#7f8c8d" }}
                          >
                            ROLE
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, color: "#2c3e50" }}
                          >
                            {formatRole(selectedUser?.role)}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  ) : (
                    <>
                      <Card
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <CheckCircle
                            sx={{
                              fontSize: 24,
                              color: selectedUser?.isVerified
                                ? "#4caf50"
                                : "#9e9e9e",
                            }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#7f8c8d" }}
                            >
                              VERIFIED STATUS
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#2c3e50" }}
                            >
                              {selectedUser?.isVerified
                                ? "Verified"
                                : "Not Verified"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                      <Card
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <LocationIcon
                            sx={{ fontSize: 24, color: "#B0E0E6" }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#7f8c8d" }}
                            >
                              COUNTY
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#2c3e50" }}
                            >
                              {displayValue(selectedUser?.county)}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                      {(selectedUser?.latitude || selectedUser?.longitude) && (
                        <>
                          <Card
                            sx={{
                              background: "white",
                              borderRadius: 2,
                              p: 2,
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <LocationIcon
                                sx={{ fontSize: 24, color: "#FFD700" }}
                              />
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#7f8c8d" }}
                                >
                                  LATITUDE
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#2c3e50" }}
                                >
                                  {selectedUser?.latitude
                                    ? parseFloat(selectedUser.latitude).toFixed(
                                        8
                                      )
                                    : "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                          <Card
                            sx={{
                              background: "white",
                              borderRadius: 2,
                              p: 2,
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <LocationIcon
                                sx={{ fontSize: 24, color: "#FFD700" }}
                              />
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#7f8c8d" }}
                                >
                                  LONGITUDE
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#2c3e50" }}
                                >
                                  {selectedUser?.longitude
                                    ? parseFloat(
                                        selectedUser.longitude
                                      ).toFixed(8)
                                    : "N/A"}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        </>
                      )}
                      <Card
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <PersonIcon sx={{ fontSize: 24, color: "#FFB6C1" }} />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#7f8c8d" }}
                            >
                              CATEGORY
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#2c3e50" }}
                            >
                              {selectedUser?.category || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                      <Card
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <GenderIcon sx={{ fontSize: 24, color: "#FFB6C1" }} />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#7f8c8d" }}
                            >
                              GENDER
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#2c3e50" }}
                            >
                              {selectedUser?.gender || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                      <Card
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <AgeIcon sx={{ fontSize: 24, color: "#B0E0E6" }} />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#7f8c8d" }}
                            >
                              AGE
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#2c3e50" }}
                            >
                              {selectedUser?.age || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                      <Card
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <OnlineIcon
                            sx={{
                              fontSize: 12,
                              color: selectedUser?.is_online
                                ? "#4caf50"
                                : "#9e9e9e",
                            }}
                          />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#7f8c8d" }}
                            >
                              STATUS
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#2c3e50" }}
                            >
                              {selectedUser?.is_online ? "Online" : "Offline"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                      {selectedUser?.bio && (
                        <Card
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Box
                            display="flex"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            gap={2}
                          >
                            <Box
                              display="flex"
                              alignItems="flex-start"
                              gap={2}
                              sx={{ flex: 1 }}
                            >
                              <BioIcon
                                sx={{ fontSize: 24, color: "#B0E0E6", mt: 0.5 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#7f8c8d" }}
                                  >
                                    BIO
                                  </Typography>
                                  {/* Bio Moderation Status */}
                                  {userTypeTabs[activeTab]?.value ===
                                    "public" && (
                                    <>
                                      {selectedUser?.bio_moderation_status ===
                                        "pending" && (
                                        <Chip
                                          icon={
                                            <PendingIcon
                                              sx={{
                                                fontSize: "0.75rem !important",
                                              }}
                                            />
                                          }
                                          label="Pending Approval"
                                          size="small"
                                          sx={{
                                            fontSize: "0.65rem",
                                            height: "20px",
                                            bgcolor: "rgba(255, 193, 7, 0.2)",
                                            color: "#B8860B",
                                            fontWeight: 600,
                                            border:
                                              "1px solid rgba(255, 193, 7, 0.4)",
                                          }}
                                        />
                                      )}
                                      {selectedUser?.bio_moderation_status ===
                                        "approved" && (
                                        <Chip
                                          icon={
                                            <CheckCircle
                                              sx={{
                                                fontSize: "0.75rem !important",
                                                color: "#4CAF50 !important",
                                              }}
                                            />
                                          }
                                          label="Approved"
                                          size="small"
                                          sx={{
                                            fontSize: "0.65rem",
                                            height: "20px",
                                            bgcolor: "rgba(76, 175, 80, 0.15)",
                                            color: "#2E7D32",
                                            fontWeight: 600,
                                            border:
                                              "1px solid rgba(76, 175, 80, 0.3)",
                                          }}
                                        />
                                      )}
                                      {selectedUser?.bio_moderation_status ===
                                        "rejected" && (
                                        <Chip
                                          icon={
                                            <CancelIcon
                                              sx={{
                                                fontSize: "0.75rem !important",
                                                color: "#F44336 !important",
                                              }}
                                            />
                                          }
                                          label="Rejected"
                                          size="small"
                                          sx={{
                                            fontSize: "0.65rem",
                                            height: "20px",
                                            bgcolor: "rgba(244, 67, 54, 0.15)",
                                            color: "#C62828",
                                            fontWeight: 600,
                                            border:
                                              "1px solid rgba(244, 67, 54, 0.3)",
                                          }}
                                        />
                                      )}
                                    </>
                                  )}
                                </Box>
                                <Typography
                                  variant="body1"
                                  sx={{
                                    fontWeight: 400,
                                    color: "#2c3e50",
                                    mt: 0.5,
                                  }}
                                >
                                  {selectedUser.bio}
                                </Typography>
                              </Box>
                            </Box>
                            {/* Bio Moderation Actions */}
                            {userTypeTabs[activeTab]?.value === "public" &&
                              selectedUser?.bio_moderation_status ===
                                "pending" && (
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  <Tooltip title="Approve Bio" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleModeration(
                                          selectedUser.id,
                                          "bio",
                                          "approve"
                                        )
                                      }
                                      disabled={
                                        moderationLoading[
                                          `${selectedUser.id}-bio`
                                        ]
                                      }
                                      sx={{
                                        bgcolor: "rgba(76, 175, 80, 0.1)",
                                        color: "#4CAF50",
                                        "&:hover": {
                                          bgcolor: "rgba(76, 175, 80, 0.2)",
                                        },
                                      }}
                                    >
                                      <ThumbUpIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Reject Bio" arrow>
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        Swal.fire({
                                          title: "Reject Bio",
                                          input: "textarea",
                                          inputLabel:
                                            "Rejection Reason (Optional)",
                                          inputPlaceholder:
                                            "Enter reason for rejection...",
                                          inputAttributes: {
                                            "aria-label":
                                              "Enter rejection reason",
                                          },
                                          showCancelButton: true,
                                          confirmButtonColor: "#d33",
                                          cancelButtonColor: "#3085d6",
                                          confirmButtonText: "Reject",
                                          cancelButtonText: "Cancel",
                                        }).then((result) => {
                                          if (result.isConfirmed) {
                                            handleModeration(
                                              selectedUser.id,
                                              "bio",
                                              "reject",
                                              result.value || ""
                                            );
                                          }
                                        });
                                      }}
                                      disabled={
                                        moderationLoading[
                                          `${selectedUser.id}-bio`
                                        ]
                                      }
                                      sx={{
                                        bgcolor: "rgba(244, 67, 54, 0.1)",
                                        color: "#F44336",
                                        "&:hover": {
                                          bgcolor: "rgba(244, 67, 54, 0.2)",
                                        },
                                      }}
                                    >
                                      <ThumbDownIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              )}
                          </Box>
                        </Card>
                      )}
                      <Card
                        sx={{
                          background: "white",
                          borderRadius: 2,
                          p: 2,
                          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                          transition: "all 0.3s ease",
                          "&:hover": {
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                            transform: "translateY(-2px)",
                          },
                        }}
                      >
                        <Box display="flex" alignItems="center" gap={2}>
                          <PhoneIcon sx={{ fontSize: 24, color: "#B0E0E6" }} />
                          <Box>
                            <Typography
                              variant="caption"
                              sx={{ color: "#7f8c8d" }}
                            >
                              PHONE
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#2c3e50" }}
                            >
                              {selectedUser?.phone || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </Card>
                    </>
                  )}
                  {userTypeTabs[activeTab]?.value === "admin" && (
                    <Card
                      sx={{
                        background: "white",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Box display="flex" alignItems="center" gap={2}>
                        <PhoneIcon sx={{ fontSize: 24, color: "#B0E0E6" }} />
                        <Box>
                          <Typography
                            variant="caption"
                            sx={{ color: "#7f8c8d" }}
                          >
                            PHONE
                          </Typography>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 600, color: "#2c3e50" }}
                          >
                            {selectedUser?.phone || "N/A"}
                          </Typography>
                        </Box>
                      </Box>
                    </Card>
                  )}
                </Stack>

                {/* Additional Info Section */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 600, mb: 2, color: "#2c3e50" }}
                  >
                    Additional Information
                  </Typography>
                  <Stack spacing={2}>
                    {userTypeTabs[activeTab]?.value === "public" && (
                      <>
                        <Card
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <WalletIcon
                              sx={{ fontSize: 24, color: "#FFD700" }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: "#7f8c8d" }}
                              >
                                TOKEN BALANCE
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, color: "#2c3e50" }}
                              >
                                {selectedUser?.token_balance || "0.00"}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                        <Card
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <BoostIcon
                              sx={{ fontSize: 24, color: "#FFD700" }}
                            />
                            <Box>
                              <Typography
                                variant="caption"
                                sx={{ color: "#7f8c8d" }}
                              >
                                BOOST SCORE
                              </Typography>
                              <Typography
                                variant="body1"
                                sx={{ fontWeight: 600, color: "#2c3e50" }}
                              >
                                {selectedUser?.boost_score || 0}
                              </Typography>
                            </Box>
                          </Box>
                        </Card>
                        {selectedUser?.is_featured_until && (
                          <Card
                            sx={{
                              background: "white",
                              borderRadius: 2,
                              p: 2,
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <FeaturedIcon
                                sx={{ fontSize: 24, color: "#FFD700" }}
                              />
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#7f8c8d" }}
                                >
                                  FEATURED UNTIL
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#2c3e50" }}
                                >
                                  {new Date(
                                    selectedUser.is_featured_until
                                  ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        )}
                        {selectedUser?.last_seen_at && (
                          <Card
                            sx={{
                              background: "white",
                              borderRadius: 2,
                              p: 2,
                              boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                              transition: "all 0.3s ease",
                              "&:hover": {
                                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                                transform: "translateY(-2px)",
                              },
                            }}
                          >
                            <Box display="flex" alignItems="center" gap={2}>
                              <LastSeenIcon
                                sx={{ fontSize: 24, color: "#B0E0E6" }}
                              />
                              <Box>
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#7f8c8d" }}
                                >
                                  LAST SEEN
                                </Typography>
                                <Typography
                                  variant="body1"
                                  sx={{ fontWeight: 600, color: "#2c3e50" }}
                                >
                                  {new Date(
                                    selectedUser.last_seen_at
                                  ).toLocaleDateString()}
                                </Typography>
                              </Box>
                            </Box>
                          </Card>
                        )}
                      </>
                    )}
                    <Card
                      sx={{
                        background: "white",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#7f8c8d", mb: 0.5 }}
                      >
                        <strong>Created:</strong>{" "}
                        {selectedUser?.createdAt
                          ? new Date(
                              selectedUser.createdAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                    </Card>
                    <Card
                      sx={{
                        background: "white",
                        borderRadius: 2,
                        p: 2,
                        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "#7f8c8d", mb: 0.5 }}
                      >
                        <strong>Last Updated:</strong>{" "}
                        {selectedUser?.updatedAt
                          ? new Date(
                              selectedUser.updatedAt
                            ).toLocaleDateString()
                          : "N/A"}
                      </Typography>
                    </Card>
                  </Stack>
                </Box>

                {/* Social Media Links Section */}
                {(selectedUser?.whatsapp_link ||
                  selectedUser?.google_link ||
                  selectedUser?.twitter_link ||
                  selectedUser?.facebook_link) && (
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 600, mb: 2, color: "#2c3e50" }}
                    >
                      Social Media Links
                    </Typography>
                    <Stack spacing={2}>
                      {selectedUser?.whatsapp_link && (
                        <Card
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>WhatsApp:</strong>{" "}
                            <a
                              href={selectedUser.whatsapp_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#25D366" }}
                            >
                              {selectedUser.whatsapp_link}
                            </a>
                          </Typography>
                        </Card>
                      )}
                      {selectedUser?.google_link && (
                        <Card
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Google:</strong>{" "}
                            <a
                              href={selectedUser.google_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#4285F4" }}
                            >
                              {selectedUser.google_link}
                            </a>
                          </Typography>
                        </Card>
                      )}
                      {selectedUser?.twitter_link && (
                        <Card
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Twitter:</strong>{" "}
                            <a
                              href={selectedUser.twitter_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#1DA1F2" }}
                            >
                              {selectedUser.twitter_link}
                            </a>
                          </Typography>
                        </Card>
                      )}
                      {selectedUser?.facebook_link && (
                        <Card
                          sx={{
                            background: "white",
                            borderRadius: 2,
                            p: 2,
                            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.12)",
                            transition: "all 0.3s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                              transform: "translateY(-2px)",
                            },
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{ color: "#7f8c8d", mb: 0.5 }}
                          >
                            <strong>Facebook:</strong>{" "}
                            <a
                              href={selectedUser.facebook_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ color: "#1877F2" }}
                            >
                              {selectedUser.facebook_link}
                            </a>
                          </Typography>
                        </Card>
                      )}
                    </Stack>
                  </Box>
                )}
              </Box>
            ) : (
              // Create/Edit User Form
              <Box
                component="form"
                noValidate
                sx={{ maxHeight: "45vh", overflowY: "auto" }}
              >
                <Stack spacing={1.5} sx={{ mt: 1 }}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={userForm.full_name}
                    onChange={(e) =>
                      setUserForm({ ...userForm, full_name: e.target.value })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={userForm.email}
                    onChange={(e) =>
                      setUserForm({ ...userForm, email: e.target.value })
                    }
                    required
                    variant="outlined"
                    size="small"
                  />
                  <TextField
                    fullWidth
                    label="Phone"
                    value={userForm.phone}
                    onChange={(e) =>
                      setUserForm({ ...userForm, phone: e.target.value })
                    }
                    variant="outlined"
                    size="small"
                  />
                  <FormControl fullWidth variant="outlined" size="small">
                    <InputLabel>Role</InputLabel>
                    <Select
                      value={userForm.role}
                      onChange={(e) =>
                        setUserForm({ ...userForm, role: e.target.value })
                      }
                      label="Role"
                    >
                      <MenuItem value="superadmin">Super Admin</MenuItem>
                      <MenuItem value="moderator">Moderator</MenuItem>
                    </Select>
                  </FormControl>
                  {openCreateDialog && (
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={userForm.password}
                      onChange={(e) =>
                        setUserForm({ ...userForm, password: e.target.value })
                      }
                      required
                      variant="outlined"
                      size="small"
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Stack>
              </Box>
            )}
          </DialogContent>
          <DialogActions
            sx={{
              p: { xs: 2, sm: 3 },
              gap: { xs: 1, sm: 2 },
              flexDirection: { xs: "column-reverse", sm: "row" },
              backgroundColor: "rgba(255, 215, 0, 0.05)",
            }}
          >
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setOpenEditDialog(false);
                setOpenCreateDialog(false);
                setSelectedUser(null);
                setShowPassword(false);
                setLoadingView(false);
                setUserForm({
                  full_name: "",
                  email: "",
                  phone: "",
                  role: "moderator",
                  password: "",
                });
              }}
              variant="outlined"
              fullWidth={isMobile}
              sx={{
                borderColor: "#B0E0E6",
                color: "#5a8a93",
                fontWeight: 600,
                borderRadius: 2,
                px: { xs: 2, sm: 3 },
                py: { xs: 1, sm: 1 },
                fontSize: { xs: "0.875rem", sm: "1rem" },
                "&:hover": {
                  borderColor: "#90C5CC",
                  backgroundColor: "rgba(176, 224, 230, 0.1)",
                },
              }}
            >
              {openViewDialog ? "Close" : "Cancel"}
            </Button>
            {(openEditDialog || openCreateDialog) && (
              <Button
                onClick={openEditDialog ? handleUpdateUser : handleCreateUser}
                variant="contained"
                startIcon={
                  isCreating || isUpdating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <AddIcon />
                  )
                }
                fullWidth={isMobile}
                sx={{
                  background: "#FFD700",
                  borderRadius: 2,
                  px: { xs: 2, sm: 4 },
                  py: { xs: 1, sm: 1 },
                  fontWeight: 600,
                  color: "#2c3e50",
                  textTransform: "none",
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)",
                  "&:hover": {
                    background: "#FFC700",
                    transform: "translateY(-1px)",
                    boxShadow: "0 6px 20px rgba(255, 215, 0, 0.4)",
                  },
                  "&:disabled": {
                    background: "rgba(255, 215, 0, 0.3)",
                    color: "rgba(44, 62, 80, 0.4)",
                  },
                  transition: "all 0.3s ease",
                }}
                disabled={
                  !userForm.full_name ||
                  !userForm.email ||
                  (openCreateDialog && !userForm.password) ||
                  isCreating ||
                  isUpdating
                }
              >
                {isCreating
                  ? "Creating..."
                  : isUpdating
                  ? "Updating..."
                  : openEditDialog
                  ? "Update User"
                  : "Create Admin"}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default UsersTable;
