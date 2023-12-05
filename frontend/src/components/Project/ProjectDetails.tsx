import {
  Box,
  Grid,
  Typography,
  Button,
  Container,
  styled,
  Table,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import MuiAccordion, { AccordionProps } from "@mui/material/Accordion";
import MuiAccordionSummary, {
  AccordionSummaryProps,
} from "@mui/material/AccordionSummary";
import ArrowForwardIosSharpIcon from "@mui/icons-material/ArrowForwardIosSharp";
import MuiAccordionDetails from "@mui/material/AccordionDetails";
import React, { useContext, useState } from "react";
const commonStyles = {
  bgcolor: "background.paper",
  borderColor: "text.primary",
  m: 1,
  border: 1,
  padding: "1rem",
};

import * as STATUS from "@/constants/status";
import TaskList from "../TaskList/TaskList";
import { UserContext } from "@/context/UserContext";

const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  color: "white",
};

const Accordion = styled((props: AccordionProps) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  "&:not(:last-child)": {
    borderBottom: 0,
  },
  "&:before": {
    display: "none",
  },
}));

const AccordionSummary = styled((props: AccordionSummaryProps) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: "0.9rem" }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor:
    theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, .05)"
      : "rgba(0, 0, 0, .03)",
  flexDirection: "row-reverse",
  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
    transform: "rotate(90deg)",
  },
  "& .MuiAccordionSummary-content": {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(2),
  borderTop: "1px solid rgba(0, 0, 0, .125)",
}));

interface User {
  user_email: string;
  user_id: number;
  user_role: string;
}

const ProjectDetails = ({
  project,
  users,
  apiAddNewProjectUser,
}: {
  project: any;
  users: any;
  apiAddNewProjectUser: any;
}) => {
  const [expanded, setExpanded] = React.useState<string | false>("panel1");
  const [newUser, setNewUser] = useState<User>();
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { allUsers } = useContext(UserContext);

  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, newExpanded: boolean) => {
      setExpanded(newExpanded ? panel : false);
    };

  const handleNewUser = (event: SelectChangeEvent) => {
    setNewUser(event.target.value);
  };

  const addNewUser = (e) => {
    e.preventDefault();
    apiAddNewProjectUser(project.id, newUser);
    handleClose();
  };

  return (
    <>
      <Container
        style={{
          padding: "1rem 0",
          minWidth: "100%",
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={3}>
            <Typography variant="h4" color="initial">
              {project.name}
            </Typography>
          </Grid>
          <Grid item xs={3}>
            {project.status ? (
              <Button
                variant="contained"
                style={{
                  backgroundColor: STATUS.PROJECT[project.status].color,
                  color: "#fff",
                }}
              >
                {STATUS.PROJECT[project.status].label}
              </Button>
            ) : (
              <Button
                variant="contained"
                style={{
                  backgroundColor: STATUS.PROJECT["CREATED"].color,
                  color: "#fff",
                }}
              >
                {STATUS.PROJECT["CREATED"].label}
              </Button>
            )}
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="outlined"
              style={{
                borderColor: "#fff",
                color: "#fff",
              }}
            >
              Allocation: {project.total_allocated_hours} hrs
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button
              variant="outlined"
              style={{
                borderColor: "#fff",
                color: "#fff",
              }}
            >
              Progress: {project.tracked_hours}/{project.total_allocated_hours}{" "}
              hrs
            </Button>
          </Grid>
        </Grid>
      </Container>
      {/* <Box
        sx={{ ...commonStyles, borderRadius: "4px" }}
        style={{ marginBlock: "16px", marginInline: "0px" }}
      >
        {project.description}
      </Box> */}

      <Accordion
        expanded={expanded === "panel1"}
        onChange={handleChange("panel1")}
      >
        <AccordionSummary aria-controls="panel1d-content" id="panel1d-header">
          <Typography>Project description</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>{project.description}</Typography>
        </AccordionDetails>
      </Accordion>
      <Accordion
        expanded={expanded === "panel2"}
        onChange={handleChange("panel2")}
      >
        <AccordionSummary aria-controls="panel2d-content" id="panel2d-header">
          <Typography>Users</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Button onClick={handleOpen} variant="outlined" color="success">
            New user
          </Button>
          <Typography>
            <Table style={{ marginTop: 20 }}>
              <TableBody>
                {users.map((user: any) => (
                  <TableRow key={user.user_id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Typography>
        </AccordionDetails>
      </Accordion>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <form onSubmit={(e) => addNewUser(e)}>
            <FormControl fullWidth>
              <InputLabel id="demo-simple-select-label">User</InputLabel>
              <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                value={newUser}
                label="Age"
                onChange={handleNewUser}
              >
                {allUsers.map((user: any) => {
                  return <MenuItem value={user.id}>{user.email}</MenuItem>;
                })}
              </Select>
            </FormControl>
            <Button
              type="submit"
              color="inherit"
              variant="outlined"
              color="success"
              onSubmit={addNewUser}
              style={{ marginTop: 20 }}
            >
              Add
            </Button>
          </form>
        </Box>
      </Modal>

      <TaskList projectId={project.id} key={project.id} />
    </>
  );
};

export default ProjectDetails;
