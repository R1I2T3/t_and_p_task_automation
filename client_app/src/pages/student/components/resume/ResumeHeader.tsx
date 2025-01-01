import { Box, Typography, Link, Stack } from "@mui/material";

import { Mail, Phone, ExternalLink } from "lucide-react";
interface ResumeHeaderProps {
  name: string;
  email: string;
  phone: string;
  contacts: string[];
}

export const ResumeHeader = ({
  name,
  email,
  phone,
  contacts,
}: ResumeHeaderProps) => (
  <Box sx={{ bgcolor: "primary.main", color: "primary.contrastText", p: 4 }}>
    <Typography variant="h3" fontWeight="bold" gutterBottom>
      {name}
    </Typography>
    <Stack direction="row" spacing={3} flexWrap="wrap" mt={2}>
      <Stack direction="row" spacing={1} alignItems="center">
        <Mail fontSize="small" />
        <Typography>{email}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <Phone fontSize="small" />
        <Typography>{phone}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        {contacts.map((contact) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <ExternalLink fontSize="small" />
            <Link
              href={contact}
              color="inherit"
              sx={{ "&:hover": { color: "primary.light" } }}
            >
              {contact}
            </Link>
          </Stack>
        ))}
      </Stack>
    </Stack>
  </Box>
);
