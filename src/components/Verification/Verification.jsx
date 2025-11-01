import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Divider,
  CircularProgress,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Tabs,
  Tab,
  Avatar,
} from "@mui/material";
import {
  Visibility as ViewIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  VerifiedUser as VerifiedUserIcon,
  Person as PersonIcon,
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Swal from "sweetalert2";

const Verification = () => {
  const theme = useTheme();
  const [allVerificationRequests, setAllVerificationRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedTab, setSelectedTab] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState("");

  const statusTabs = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  useEffect(() => {
    fetchVerificationRequests();
  }, []);

  // Filter requests based on selected tab
  const verificationRequests = React.useMemo(() => {
    const selectedStatus = statusTabs[selectedTab].value;
    if (selectedStatus === "all") {
      return allVerificationRequests;
    }
    return allVerificationRequests.filter(
      (req) => req.verification_status === selectedStatus
    );
  }, [allVerificationRequests, selectedTab]);

  const fetchVerificationRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");

      if (!token) {
        setError("No authentication token found. Please login again.");
        return;
      }

      const response = await fetch(`/api/verification/`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setAllVerificationRequests(data.data || []);
      } else {
        setError(
          "Failed to fetch verification requests: " + (data.message || "Unknown error")
        );
      }
    } catch (err) {
      setError("Error fetching verification requests: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "success";
      case "rejected":
        return "error";
      case "pending":
        return "warning";
      default:
        return "default";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setOpenViewDialog(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    const token = localStorage.getItem("token");

    try {
      console.log("Approving verification request:", selectedRequest.id);
      const response = await fetch(`/api/verification/${selectedRequest.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes || null }),
      });

      const data = await response.json();
      console.log("Approve response:", data);

      if (data.success) {
        // Update the local state immediately
        setAllVerificationRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, ...data.data, verification_status: "approved" }
              : req
          )
        );

        Swal.fire({
          icon: "success",
          title: "Approved!",
          text: data.message || "Verification request has been approved successfully. User is now verified.",
          confirmButtonColor: "#667eea",
        });
        setOpenApproveDialog(false);
        setOpenViewDialog(false);
        setSelectedRequest(null);
        setNotes("");
        
        // Refresh the list to get updated data
        await fetchVerificationRequests();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to approve verification request.",
          confirmButtonColor: "#667eea",
        });
      }
    } catch (err) {
      console.error("Approve error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to approve verification request. Please try again.",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    setActionLoading(true);
    const token = localStorage.getItem("token");

    try {
      console.log("Rejecting verification request:", selectedRequest.id);
      const response = await fetch(`/api/verification/${selectedRequest.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes: notes || null }),
      });

      const data = await response.json();
      console.log("Reject response:", data);

      if (data.success) {
        // Update the local state immediately
        setAllVerificationRequests((prev) =>
          prev.map((req) =>
            req.id === selectedRequest.id
              ? { ...req, ...data.data, verification_status: "rejected" }
              : req
          )
        );

        Swal.fire({
          icon: "success",
          title: "Rejected!",
          text: data.message || "Verification request has been rejected.",
          confirmButtonColor: "#667eea",
        });
        setOpenRejectDialog(false);
        setOpenViewDialog(false);
        setSelectedRequest(null);
        setNotes("");
        
        // Refresh the list to get updated data
        await fetchVerificationRequests();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: data.message || "Failed to reject verification request.",
          confirmButtonColor: "#667eea",
        });
      }
    } catch (err) {
      console.error("Reject error:", err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to reject verification request. Please try again.",
        confirmButtonColor: "#667eea",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    setPage(0); // Reset to first page when changing tabs
  };

  const paginatedRequests = verificationRequests.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  const totalRequests = verificationRequests.length;

  // Calculate counts for each status tab
  const getCountForStatus = (status) => {
    if (status === "all") {
      return allVerificationRequests.length;
    }
    return allVerificationRequests.filter(
      (req) => req.verification_status === status
    ).length;
  };

  if (error && allVerificationRequests.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        minHeight: "100vh",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 0,
          overflow: "hidden",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          border: "none",
          boxShadow: "none",
          minHeight: "100vh",
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            p: 3,
            color: "white",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: "rgba(255, 255, 255, 0.1)",
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
              background: "rgba(255, 255, 255, 0.05)",
              borderRadius: "50%",
              zIndex: 0,
            }}
          />
          <Box position="relative" zIndex={1}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                mb: 1,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontSize: { xs: "1.5rem", sm: "2rem", md: "2.125rem" },
              }}
            >
              Premium User Verification
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Review and manage premium user verification requests
            </Typography>
          </Box>
        </Box>

        {/* Content Section */}
        <Box
          sx={{ p: { xs: 1, sm: 2, md: 3 }, minHeight: "calc(100vh - 200px)" }}
        >
          {/* Status Tabs */}
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              borderRadius: 3,
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
              overflow: "hidden",
            }}
          >
            <Tabs
              value={selectedTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: 600,
                  minHeight: 48,
                  color: "#667eea",
                  "&.Mui-selected": {
                    color: "#667eea",
                    backgroundColor: "rgba(102, 126, 234, 0.1)",
                  },
                },
                "& .MuiTabs-indicator": {
                  backgroundColor: "#667eea",
                  height: 3,
                },
              }}
            >
              {statusTabs.map((tab, index) => (
                <Tab
                  key={tab.value}
                  label={
                    <Box display="flex" alignItems="center" gap={1}>
                      <span>{tab.label}</span>
                      <Chip
                        label={getCountForStatus(tab.value)}
                        size="small"
                        sx={{
                          backgroundColor:
                            selectedTab === index ? "#667eea" : "#e0e0e0",
                          color: selectedTab === index ? "white" : "#666",
                          fontWeight: 600,
                          fontSize: "0.75rem",
                          height: 20,
                          minWidth: 20,
                        }}
                      />
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Paper>

          {/* Verification Requests Table */}
          <TableContainer
            sx={{
              borderRadius: 3,
              overflowX: "auto",
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              border: "1px solid rgba(102, 126, 234, 0.1)",
            }}
          >
            <Table sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow
                  sx={{
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    "& .MuiTableCell-head": {
                      color: "white",
                      fontWeight: 700,
                      fontSize: { xs: "0.8rem", sm: "0.95rem" },
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      border: "none",
                      whiteSpace: "nowrap",
                    },
                  }}
                >
                  <TableCell>No</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Request Date</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <CircularProgress sx={{ color: "#667eea" }} />
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                      <Button
                        variant="contained"
                        onClick={fetchVerificationRequests}
                        sx={{
                          background: "linear-gradient(45deg, #667eea, #764ba2)",
                        }}
                      >
                        Retry
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : paginatedRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="h6" color="text.secondary">
                        No verification requests found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRequests.map((request, idx) => (
                    <TableRow
                      key={request.id}
                      sx={{
                        "&:nth-of-type(even)": {
                          backgroundColor: "rgba(102, 126, 234, 0.02)",
                        },
                        "&:hover": {
                          backgroundColor: "rgba(102, 126, 234, 0.08)",
                        },
                        transition: "all 0.2s ease",
                        "& .MuiTableCell-root": {
                          fontSize: { xs: "0.75rem", sm: "0.875rem" },
                          padding: { xs: "8px 4px", sm: "16px" },
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600, color: "#667eea" }}>
                        {page * rowsPerPage + idx + 1}
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Avatar
                            src={
                              request.publicUser?.photo
                                ? `/api/uploads/${request.publicUser.photo}`
                                : undefined
                            }
                            sx={{ width: 32, height: 32 }}
                          >
                            <PersonIcon />
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              fontWeight="600"
                              sx={{ color: "#2c3e50" }}
                            >
                              {request.publicUser?.name || "Unknown"}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#7f8c8d" }}>
                              {request.publicUser?.email || "N/A"}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.publicUser?.category || "Regular"}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            borderRadius: 2,
                            backgroundColor: "#667eea",
                            color: "white",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.verification_status}
                          color={getStatusColor(request.verification_status)}
                          size="small"
                          sx={{
                            textTransform: "capitalize",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: "#7f8c8d", fontWeight: 600 }}
                        >
                          {formatDate(request.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" gap={0.5}>
                          <Tooltip title="View Details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleViewRequest(request)}
                              sx={{
                                color: "#27ae60",
                                backgroundColor: "rgba(39, 174, 96, 0.1)",
                                "&:hover": {
                                  backgroundColor: "rgba(39, 174, 96, 0.2)",
                                  transform: "scale(1.1)",
                                },
                                transition: "all 0.2s ease",
                                borderRadius: 2,
                              }}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {request.verification_status === "pending" && (
                            <>
                              <Tooltip title="Approve" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setOpenApproveDialog(true);
                                  }}
                                  sx={{
                                    color: "#27ae60",
                                    backgroundColor: "rgba(39, 174, 96, 0.1)",
                                    "&:hover": {
                                      backgroundColor: "rgba(39, 174, 96, 0.2)",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease",
                                    borderRadius: 2,
                                  }}
                                >
                                  <CheckIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject" arrow>
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    setSelectedRequest(request);
                                    setOpenRejectDialog(true);
                                  }}
                                  sx={{
                                    color: "#e74c3c",
                                    backgroundColor: "rgba(231, 76, 60, 0.1)",
                                    "&:hover": {
                                      backgroundColor: "rgba(231, 76, 60, 0.2)",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s ease",
                                    borderRadius: 2,
                                  }}
                                >
                                  <CancelIcon fontSize="small" />
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
            count={totalRequests}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              backgroundColor: "rgba(255, 255, 255, 0.8)",
              borderTop: "1px solid rgba(102, 126, 234, 0.1)",
            }}
          />
        </Box>

        {/* View Request Dialog */}
        <Dialog
          open={openViewDialog}
          onClose={() => {
            setOpenViewDialog(false);
            setSelectedRequest(null);
          }}
          maxWidth="sm"
          fullWidth
          sx={{
            "& .MuiDialog-paper": {
              borderRadius: 4,
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
              maxHeight: "85vh",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(102, 126, 234, 0.2)",
            },
          }}
        >
          <DialogTitle
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 3,
            }}
          >
            <VerifiedUserIcon sx={{ fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Verification Request Details
              </Typography>
            </Box>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 3, maxHeight: "70vh", overflowY: "auto" }}>
            {selectedRequest && (
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    User Information
                  </Typography>
                  <Box display="flex" alignItems="center" gap={2} mt={1}>
                    <Avatar
                      src={
                        selectedRequest.publicUser?.photo
                          ? `/api/uploads/${selectedRequest.publicUser.photo}`
                          : undefined
                      }
                      sx={{ width: 64, height: 64 }}
                    >
                      <PersonIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="body1" fontWeight="600">
                        {selectedRequest.publicUser?.name || "Unknown"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedRequest.publicUser?.email || "N/A"}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedRequest.publicUser?.phone || "N/A"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Divider />

                <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Chip
                      label={selectedRequest.publicUser?.category || "Regular"}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Status
                    </Typography>
                    <Chip
                      label={selectedRequest.verification_status}
                      color={getStatusColor(selectedRequest.verification_status)}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>

                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    Request Date
                  </Typography>
                  <Typography variant="body2">
                    {formatDate(selectedRequest.createdAt)}
                  </Typography>
                </Box>

                {selectedRequest.notes && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      Admin Notes
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        p: 2,
                        backgroundColor: "rgba(102, 126, 234, 0.05)",
                        borderRadius: 2,
                        border: "1px solid rgba(102, 126, 234, 0.1)",
                      }}
                    >
                      {selectedRequest.notes}
                    </Typography>
                  </Box>
                )}

                {selectedRequest.publicUser?.bio && (
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      User Bio
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        p: 2,
                        backgroundColor: "rgba(102, 126, 234, 0.05)",
                        borderRadius: 2,
                      }}
                    >
                      {selectedRequest.publicUser.bio}
                    </Typography>
                  </Box>
                )}
              </Stack>
            )}
          </DialogContent>
          <DialogActions
            sx={{ p: 3, gap: 2, backgroundColor: "rgba(102, 126, 234, 0.05)" }}
          >
            {selectedRequest?.verification_status === "pending" && (
              <>
                <Button
                  onClick={() => {
                    setOpenViewDialog(false);
                    setSelectedRequest(null);
                    setOpenApproveDialog(true);
                  }}
                  variant="contained"
                  startIcon={<CheckIcon />}
                  sx={{
                    background: "linear-gradient(45deg, #27ae60, #229954)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #229954, #27ae60)",
                    },
                  }}
                >
                  Approve
                </Button>
                <Button
                  onClick={() => {
                    setOpenViewDialog(false);
                    setSelectedRequest(null);
                    setOpenRejectDialog(true);
                  }}
                  variant="contained"
                  startIcon={<CancelIcon />}
                  sx={{
                    background: "linear-gradient(45deg, #e74c3c, #c0392b)",
                    "&:hover": {
                      background: "linear-gradient(45deg, #c0392b, #e74c3c)",
                    },
                  }}
                >
                  Reject
                </Button>
              </>
            )}
            <Button
              onClick={() => {
                setOpenViewDialog(false);
                setSelectedRequest(null);
              }}
              variant="outlined"
              sx={{
                borderColor: "#667eea",
                color: "#667eea",
                fontWeight: 600,
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Approve Dialog */}
        <Dialog
          open={openApproveDialog}
          onClose={() => {
            setOpenApproveDialog(false);
            setNotes("");
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Approve Verification Request</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Notes (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this approval..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenApproveDialog(false);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleApprove}
              variant="contained"
              disabled={actionLoading}
              sx={{
                background: "linear-gradient(45deg, #27ae60, #229954)",
              }}
            >
              {actionLoading ? <CircularProgress size={20} /> : "Approve"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={openRejectDialog}
          onClose={() => {
            setOpenRejectDialog(false);
            setNotes("");
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reject Verification Request</DialogTitle>
          <DialogContent>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason (Optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add reason for rejection..."
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenRejectDialog(false);
                setNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              variant="contained"
              disabled={actionLoading}
              sx={{
                background: "linear-gradient(45deg, #e74c3c, #c0392b)",
              }}
            >
              {actionLoading ? <CircularProgress size={20} /> : "Reject"}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default Verification;
