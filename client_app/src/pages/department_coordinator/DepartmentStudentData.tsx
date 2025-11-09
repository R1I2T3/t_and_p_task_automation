/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import {
    Box,
    Button,
    TextField,
    Card,
    CardContent,
    Typography,
    CircularProgress,
    Alert,
    Stack,
    Chip,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails,
} from '@mui/material';
import { ChevronDown, CheckCircle, X } from 'lucide-react';
import { DeptStudentFormData } from './types';
import { getCookie } from '../../utils';

function DepartmentStudentData() {
    const csrfToken = getCookie('csrftoken');
    const [studentData, setStudentData] = useState<DeptStudentFormData | null>(null);
    const [uidInput, setUidInput] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleFetchStudent = async (event?: React.FormEvent<HTMLFormElement>) => {
        if (event) event.preventDefault();

        if (!uidInput) {
            setError('Please enter a UID');
            return;
        }

        setError('');
        setLoading(true);
        try {
            const response = await axios.get(`/api/department_coordinator/student-data/?uid=${uidInput}`, {
                headers: {
                    'X-CSRFToken': csrfToken || '',
                },
                withCredentials: true,
            });
            setStudentData(response.data.student as DeptStudentFormData);
        } catch (err: any) {
            setStudentData(null);
            setError(err?.response?.data?.error || 'Failed to fetch student');
        } finally {
            setLoading(false);
        }
    };

    const getCardColor = (card: string) => {
        const colors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
            'Green': 'success',
            'Yellow': 'warning',
            'Red': 'error',
            'Blue': 'info'
        };
        return colors[card] || 'default';
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, "success" | "warning" | "error" | "info" | "default"> = {
            'joined': 'success',
            'accepted': 'info',
            'pending': 'warning',
            'rejected': 'error'
        };
        return colors[status?.toLowerCase()] || 'default';
    };

    return (
        <Box maxWidth="1200px" mx="auto" p={4}>
            <Typography variant="h4" mb={3} fontWeight="bold" textAlign="center">
                Student Profile Viewer
            </Typography>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <form onSubmit={handleFetchStudent}>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            fullWidth
                            label="Enter Student UID"
                            variant="outlined"
                            value={uidInput}
                            onChange={(e) => setUidInput(e.target.value)}
                            placeholder="e.g., 22-ITA50-26"
                        />
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={loading}
                            sx={{ minWidth: 120 }}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                        </Button>
                    </Stack>
                </form>
            </Paper>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {loading && !studentData && (
                <Box textAlign="center" my={5}>
                    <CircularProgress size={60} />
                    <Typography mt={2} color="text.secondary">Loading student data...</Typography>
                </Box>
            )}

            {studentData && (
                <Stack spacing={3}>
                    {/* Basic Information */}
                    <Card elevation={3}>
                        <CardContent>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                                <Typography variant="h5" fontWeight="bold">
                                    {studentData.user?.full_name ?? 'N/A'}
                                </Typography>
                                <Chip
                                    label={studentData.card ?? 'No Card'}
                                    color={getCardColor(studentData.card ?? '')}
                                />
                            </Stack>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1}>
                                        <InfoRow label="UID" value={studentData.uid} />
                                        <InfoRow label="Email" value={studentData.user?.email} />
                                        <InfoRow label="Personal Email" value={studentData.personal_email} />
                                        <InfoRow label="Contact" value={studentData.contact} />
                                        <InfoRow label="Date of Birth" value={studentData.dob} />
                                        <InfoRow label="Gender" value={studentData.gender} />
                                    </Stack>
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <Stack spacing={1}>
                                        <InfoRow label="Department" value={studentData.department} />
                                        <InfoRow label="Division" value={studentData.division} />
                                        <InfoRow label="Academic Year" value={studentData.academic_year} />
                                        <InfoRow label="Batch" value={studentData.batch} />
                                        <InfoRow label="Category" value={studentData.current_category} />
                                        <InfoRow label="Consent" value={studentData.consent} />
                                    </Stack>
                                </Grid>
                            </Grid>
                        </CardContent>
                    </Card>

                    {/* Academic Performance */}
                    <Card elevation={3}>
                        <CardContent>
                            <Typography variant="h6" fontWeight="bold" mb={2}>
                                Academic Performance
                            </Typography>
                            <Grid container spacing={3}>
                                <Grid item xs={6} sm={3}>
                                    <MetricCard label="CGPA" value={studentData.cgpa} max={10} />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <MetricCard label="Attendance" value={studentData.attendance} max={100} unit="%" />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <MetricCard label="10th Grade" value={studentData.tenth_grade} max={100} unit="%" />
                                </Grid>
                                <Grid item xs={6} sm={3}>
                                    <MetricCard label="12th Grade" value={studentData.higher_secondary_grade} max={100} unit="%" />
                                </Grid>
                            </Grid>

                            <Stack direction="row" spacing={2} mt={3} flexWrap="wrap">
                                <StatusChip
                                    label={studentData.is_kt ? "Has KT" : "No KT"}
                                    active={!studentData.is_kt}
                                />
                                <StatusChip
                                    label={studentData.is_blacklisted ? "Blacklisted" : "Not Blacklisted"}
                                    active={!studentData.is_blacklisted}
                                />
                                <StatusChip
                                    label={studentData.joined_company ? "Joined Company" : "Not Joined"}
                                    active={studentData.joined_company}
                                />
                                <StatusChip
                                    label={studentData.is_dse_student ? "DSE Student" : "Regular Student"}
                                    active={studentData.is_dse_student}
                                />
                            </Stack>
                        </CardContent>
                    </Card>

                    {/* Offers */}
                    {studentData.offers && studentData.offers.length > 0 && (
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Job Offers ({studentData.offers.length})
                                </Typography>
                                <Stack spacing={2}>
                                    {studentData.offers.map((offer: any, index: number) => (
                                        <Paper key={index} variant="outlined" sx={{ p: 2 }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {offer.company_name}
                                                </Typography>
                                                <Chip
                                                    label={offer.status}
                                                    color={getStatusColor(offer.status)}
                                                    size="small"
                                                />
                                            </Stack>
                                            <Typography variant="body2" color="text.secondary" mb={1}>
                                                {offer.job_offer_info}
                                            </Typography>
                                            <Stack direction="row" spacing={2}>
                                                <Chip label={`₹${(offer.salary / 100000).toFixed(1)}L`} size="small" variant="outlined" />
                                                <Chip label={offer.offer_type} size="small" variant="outlined" />
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    )}

                    {/* Applications */}
                    {studentData.applications && studentData.applications.length > 0 && (
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Applications ({studentData.applications.length})
                                </Typography>
                                {studentData.applications.map((app: any, index: number) => (
                                    <Accordion key={index} defaultExpanded={index === 0}>
                                        <AccordionSummary expandIcon={<ChevronDown />}>
                                            <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                                <Typography fontWeight="bold">{app.company_name}</Typography>
                                                {app.progress?.final_result && (
                                                    <Chip
                                                        label={app.progress.final_result}
                                                        size="small"
                                                        color={app.progress.final_result === 'Selected' ? 'success' : 'default'}
                                                    />
                                                )}
                                            </Stack>
                                        </AccordionSummary>
                                        <AccordionDetails>
                                            <Stack spacing={2}>
                                                <Typography variant="body2" color="text.secondary">
                                                    {app.job_offer_info}
                                                </Typography>
                                                <Typography variant="body2">
                                                    Applied: {app.application_date}
                                                </Typography>

                                                {app.progress && (
                                                    <Box>
                                                        <Typography variant="subtitle2" mb={1}>Progress:</Typography>
                                                        <Grid container spacing={1}>
                                                            <ProgressItem label="Registered" completed={app.progress.registered} />
                                                            <ProgressItem label="Aptitude Test" completed={app.progress.aptitude_test} />
                                                            <ProgressItem label="Coding Test" completed={app.progress.coding_test} />
                                                            <ProgressItem label="Technical Interview" completed={app.progress.technical_interview} />
                                                            <ProgressItem label="HR Interview" completed={app.progress.hr_interview} />
                                                            <ProgressItem label="GD" completed={app.progress.gd} />
                                                        </Grid>
                                                    </Box>
                                                )}
                                            </Stack>
                                        </AccordionDetails>
                                    </Accordion>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* Training Performance */}
                    {studentData.training_performance && studentData.training_performance.length > 0 && (
                        <Card elevation={3}>
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" mb={2}>
                                    Training Performance
                                </Typography>
                                <Stack spacing={2}>
                                    {studentData.training_performance.map((training: any, index: number) => (
                                        <Accordion key={index}>
                                            <AccordionSummary expandIcon={<ChevronDown />}>
                                                <Stack direction="row" spacing={2} alignItems="center" width="100%">
                                                    <Typography fontWeight="bold">{training.training_type}</Typography>
                                                    <Chip label={training.semester} size="small" />
                                                    <Typography variant="body2" color="text.secondary">
                                                        Avg: {training.average_marks}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary" ml="auto">
                                                        {training.date}
                                                    </Typography>
                                                </Stack>
                                            </AccordionSummary>
                                            <AccordionDetails>
                                                <TableContainer>
                                                    <Table size="small">
                                                        <TableHead>
                                                            <TableRow>
                                                                <TableCell><strong>Category</strong></TableCell>
                                                                <TableCell align="right"><strong>Marks</strong></TableCell>
                                                            </TableRow>
                                                        </TableHead>
                                                        <TableBody>
                                                            {training.categories.map((cat: any, idx: number) => (
                                                                <TableRow key={idx}>
                                                                    <TableCell>{cat.category_name}</TableCell>
                                                                    <TableCell align="right">{cat.marks}</TableCell>
                                                                </TableRow>
                                                            ))}
                                                            <TableRow>
                                                                <TableCell><strong>Total</strong></TableCell>
                                                                <TableCell align="right"><strong>{training.total_marks}</strong></TableCell>
                                                            </TableRow>
                                                        </TableBody>
                                                    </Table>
                                                </TableContainer>
                                            </AccordionDetails>
                                        </Accordion>
                                    ))}
                                </Stack>
                            </CardContent>
                        </Card>
                    )}
                </Stack>
            )}
        </Box>
    );
}

// Helper Components
function InfoRow({ label, value }: { label: string; value?: string | number | null }) {
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" component="span">
                {label}:{' '}
            </Typography>
            <Typography variant="body2" component="span" fontWeight="medium">
                {value ?? 'N/A'}
            </Typography>
        </Box>
    );
}

function MetricCard({ label, value, max, unit = '' }: { label: string; value?: number | null; max: number; unit?: string }) {
    const percentage = value ? (value / max) * 100 : 0;
    const color: "success" | "warning" | "error" = percentage >= 75 ? 'success' : percentage >= 50 ? 'warning' : 'error';

    return (
        <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h4" color={`${color}.main`} fontWeight="bold">
                {value ?? 'N/A'}{unit}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
        </Paper>
    );
}

function StatusChip({ label, active }: { label: string; active?: boolean }) {
    return (
        <Chip
            icon={active ? <CheckCircle size={16} /> : <X size={16} />}
            label={label}
            color={active ? 'success' : 'error'}
            variant="outlined"
            size="small"
        />
    );
}

function ProgressItem({ label, completed }: { label: string; completed?: boolean }) {
    return (
        <Grid item xs={6} sm={4}>
            <Stack direction="row" spacing={1} alignItems="center">
                {completed ?
                    <CheckCircle size={16} /> :
                    <X size={16} />
                }
                <Typography variant="body2">{label}</Typography>
            </Stack>
        </Grid>
    );
}

export default DepartmentStudentData;
