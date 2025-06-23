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
    Divider,
} from '@mui/material';
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
            setStudentData(response.data.student);
        } catch (err: any) {
            setStudentData(null);
            setError(err.response?.data?.error || 'Failed to fetch student');
        } finally {
            setLoading(false);
        }
    };

    const renderSemesterSection = (title: string, data: any[] | undefined, keys: string[]) => {
        if (!data || data.length === 0) return null;

        return (
            <Box mt={2}>
                <Typography variant="subtitle1" gutterBottom>
                    {title}
                </Typography>
                {data.map((item, index) => (
                    <Card key={index} variant="outlined" sx={{ mb: 1, p: 1 }}>
                        {keys.map((key) => (
                            <Typography key={key}>
                                <strong>{key.replace(/_/g, ' ')}:</strong> {item[key] ?? 'N/A'}
                            </Typography>
                        ))}
                    </Card>
                ))}
            </Box>
        );
    };

    return (
        <Box maxWidth="700px" mx="auto" p={4}>
            <Typography variant="h5" mb={2} textAlign="center">
                Fetch Student Profile
            </Typography>

            <form onSubmit={handleFetchStudent}>
                <Stack direction="row" spacing={2} mb={3}>
                    <TextField
                        fullWidth
                        label="Enter Student UID"
                        variant="outlined"
                        value={uidInput}
                        onChange={(e) => setUidInput(e.target.value)}
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : 'Search'}
                    </Button>
                </Stack>
            </form>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && !studentData && (
                <Box textAlign="center" my={3}>
                    <CircularProgress />
                </Box>
            )}

            {studentData && (
                <Card variant="outlined" sx={{ mt: 2 }}>
                    <CardContent>
                        <Typography variant="h6" gutterBottom>
                            Student Profile
                        </Typography>
                        <Typography><strong>UID:</strong> {studentData.uid ?? 'N/A'}</Typography>
                        <Typography><strong>Department:</strong> {studentData.department ?? 'N/A'}</Typography>
                        <Typography><strong>Academic Year:</strong> {studentData.academic_year ?? 'N/A'}</Typography>
                        <Typography><strong>Batch:</strong> {studentData.batch ?? 'N/A'}</Typography>
                        <Typography><strong>Current Category:</strong> {studentData.current_category ?? 'N/A'}</Typography>
                        <Typography><strong>Consent:</strong> {studentData.consent ? 'Given' : 'Not Given'}</Typography>
                        <Typography><strong>Student Coordinator:</strong> {studentData.is_student_coordinator ? 'Yes' : 'No'}</Typography>
                        <Typography><strong>PLI:</strong> {studentData.is_pli ? 'Yes' : 'No'}</Typography>

                        <Divider sx={{ my: 2 }} />

                        {renderSemesterSection("Academic Performance", studentData.academic_performance, ['semester', 'performance'])}
                        {renderSemesterSection("Academic Attendance", studentData.academic_attendance, ['semester', 'attendance'])}
                        {/* {renderSemesterSection("Training Performance", studentData.training_performance, ['semester', 'training_performance', 'program'])}
                        {renderSemesterSection("Training Attendance", studentData.training_attendance, ['semester', 'training_attendance', 'program'])} */}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}

export default DepartmentStudentData;
