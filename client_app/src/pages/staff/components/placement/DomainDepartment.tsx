// components/DomainDepartmentsForm.tsx
import {
  Grid,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { FormDataType } from "../../placement_company";

interface Props {
  formData: FormDataType;
  setFormData: React.Dispatch<React.SetStateAction<FormDataType>>;
}

const departmentOptions = [
  "CS",
  "IT",
  "AI & DS",
  "AL & ML",
  "CIVIL",
  "E & TC",
  "ELEX",
  "IOT",
  "MECH",
];

const DomainDepartmentsForm = ({ formData, setFormData }: Props) => {
  const handleDepartmentChange = (e: any) => {
    const { value, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      selectedDepartments: checked
        ? [...prevData.selectedDepartments, value]
        : prevData.selectedDepartments.filter((dept) => dept !== value),
    }));
  };

  return (
    <>
      <Grid item xs={12}>
        <Select
          name="domain"
          value={formData.domain}
          onChange={(e) =>
            setFormData({ ...formData, domain: e.target.value as string })
          }
          fullWidth
        >
          <MenuItem value="core">Core</MenuItem>
          <MenuItem value="it">IT</MenuItem>
        </Select>
      </Grid>

      <Grid item xs={12}>
        <Select
          name="Departments"
          value={formData.Departments}
          onChange={(e) => {
            const value = e.target.value;
            setFormData({
              ...formData,
              Departments: value,
              selectedDepartments:
                value === "all" ? [] : formData.selectedDepartments,
            });
          }}
          fullWidth
        >
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="select">Select Departments</MenuItem>
        </Select>
      </Grid>

      {formData.Departments === "select" && (
        <Grid item xs={12}>
          <Grid container spacing={1}>
            {departmentOptions.map((dept) => (
              <Grid item xs={6} key={dept}>
                <FormControlLabel
                  control={
                    <Checkbox
                      value={dept}
                      checked={formData.selectedDepartments.includes(dept)}
                      onChange={handleDepartmentChange}
                      color="primary"
                    />
                  }
                  label={dept}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default DomainDepartmentsForm;
