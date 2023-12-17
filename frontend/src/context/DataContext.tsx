import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as API from "@/constants/api";
import * as SNACKBAR from "@/constants/snackbar";
import useWebSocket from "react-use-websocket";

interface TimeRecordProps {
  id: number;
  description: string;
  start_time: string;
  end_time: string | null;
  task: number | null;
  tracked_hours: number;
  date: string;
}

interface DataContextProviderProps {
  children: ReactNode;
}

interface Notification {
  message: string;
  type: string;
  user_email: string;
  user_id: number;
  read: boolean | null;
}

interface Project {
  id: number;
  name: string;
}

interface Task {
  name: string;
  description: string;
  max_allocated_hours: number | null;
  status: string | null;
  due_date: string | null;
  project: number;
}

const DataContext = createContext<TimeRecordProps>({
  id: 0,
  description: "",
  start_time: "",
  end_time: "",
  task: 0,
  tracked_hours: 0,
  date: "",
});

const DataContextProvider = ({ children }: DataContextProviderProps) => {
  const [notification, setNotification] = useState<Notification>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [records, setRecords] = useState<TimeRecordProps[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    status: "success",
    message: "",
  });

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  useEffect(() => {
    getRecords();
    getProjects();
    getNotifications();
  }, []);

  useEffect(() => {
    // test
  }, [notification]);

  const getNotifications = async () => {
    try {
      const response = await fetch(API.NOTIFICATIONS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getRecords = async () => {
    try {
      const response = await fetch(API.RECENT_TRACKING, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setRecords(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjects = async () => {
    try {
      const response = await fetch(API.PROJECTS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.log(error);
    }
  };

  const getProjectStatusTypes = async () => {
    //get request
    return { CREATED: "CREATED", DONE: "DONE", IN_PROGRESS: "IN_PROGRESS" };
  };

  // expected request call
  // const updateProjectStatus = async (id: number, status: string) => {
  // mock call
  const updateProjectStatus = async (project: any, status: string) => {
    // patch / put
    return { ...project, status: status };
  };

  const apiTrackingDelete = async (id: number) => {
    try {
      const response = await fetch(
        API.TRACKING_UPDATE.replace("[id]", id.toString()),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          status: SNACKBAR.SNACKBAR_STATUS.SUCCESS,
          message: SNACKBAR.SNACKBAR_MESSAGE.DELETED,
        });
      }
      getRecords();
    } catch (error) {
      console.log(error);
    }
  };

  const apiTrackingUpdate = async (id: number, body: any) => {
    try {
      const response = await fetch(
        API.TRACKING_UPDATE.replace("[id]", id.toString()),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          status: SNACKBAR.SNACKBAR_STATUS.SUCCESS,
          message: SNACKBAR.SNACKBAR_MESSAGE.UPDATED,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      getRecords();
    }
  };

  const apiProjectUpdate = async (id: number, body: any) => {
    try {
      const response = await fetch(API.PROJECT.replace("[id]", id.toString()), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          status: SNACKBAR.SNACKBAR_STATUS.SUCCESS,
          message: SNACKBAR.SNACKBAR_MESSAGE.UPDATED,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      getProjects();
    }
  };

  const apiProjectDelete = async (id: number) => {
    try {
      const response = await fetch(API.PROJECT.replace("[id]", id.toString()), {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      if (response.ok) {
        setSnackbar({
          open: true,
          status: SNACKBAR.SNACKBAR_STATUS.WARNING,
          message: SNACKBAR.SNACKBAR_MESSAGE.DELETED,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      getProjects();
      handleClose();
    }
  };

  const apiProjectCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const inputs = new FormData(e.target);
    const inputsObject = {};
    inputs.forEach((value, name) => {
      inputsObject[name] = value;
    });

    const createProject = async () => {
      try {
        const response = await fetch(API.PROJECTS, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
          body: JSON.stringify(inputsObject),
        });
        const data = await response.json();
        setProjects([data, ...projects]);
      } catch (error) {
        console.log(error);
      }
    };
    createProject();
    handleClose();
  };

  const apiTaskDelete = async (projectId: number, taskId: number) => {
    try {
      const response = await fetch(
        API.PROJECT_TASK.replace("[projectId]", projectId.toString()).replace(
          "[taskId]",
          taskId.toString()
        ),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
        }
      );
      if (response.ok) {
        setSnackbar({
          open: true,
          status: SNACKBAR.SNACKBAR_STATUS.WARNING,
          message: SNACKBAR.SNACKBAR_MESSAGE.DELETED,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      getTasks(projectId);
      handleClose();
    }
  };

  const getTasks = async (projectId: number) => {
    try {
      const response = await fetch(
        API.PROJECT_TASKS.replace("[id]", projectId),
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
        }
      );
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.log(error);
    }
  };

  const apiTaskCreate = (
    e: React.FormEvent<HTMLFormElement>,
    projectId: number
  ) => {
    e.preventDefault();
    const inputs = new FormData(e.target);
    const inputsObject = {};
    inputs.forEach((value, name) => {
      inputsObject[name] = value;
    });

    if (selectedDate != null) {
      inputsObject["due_date"] = selectedDate.$d.toISOString().split("T")[0];
    }

    const createTask = async () => {
      try {
        const response = await fetch(
          API.PROJECT_TASKS.replace("[id]", projectId),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              // Authorization: "Bearer " + String(session.data.user.access),
              Authorization: "Bearer " + process.env.ACCESS_TOKEN,
            },
            body: JSON.stringify(inputsObject),
          }
        );
        const data = await response.json();
        console.log(data);

        setTasks([data, ...tasks]);
      } catch (error) {
        console.log(error);
      }
    };
    createTask();
    handleClose();
  };

  const apiTaskUpdate = async (
    projectId: number,
    taskId: number,
    body: any
  ) => {
    try {
      const response = await fetch(
        API.PROJECT_TASK.replace("[projectId]", projectId.toString()).replace(
          "[taskId]",
          taskId.toString()
        ),
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            // Authorization: "Bearer " + String(session.data.user.access),
            Authorization: "Bearer " + process.env.ACCESS_TOKEN,
          },
          body: JSON.stringify(body),
        }
      );

      if (response.ok) {
        setSnackbar({
          open: true,
          status: SNACKBAR.SNACKBAR_STATUS.SUCCESS,
          message: SNACKBAR.SNACKBAR_MESSAGE.UPDATED,
        });
      }
    } catch (error) {
      console.log(error);
    } finally {
      getTasks(projectId);
    }
  };

  useWebSocket(`ws://localhost:9000/ws/notifications/`, {
    onMessage: (e) => {
      const message = JSON.parse(e.data);
      setNotification(message);
    },
    shouldReconnect: (closeEvent) => true,
  });

  return (
    <DataContext.Provider
      value={{
        records,
        setRecords,
        apiTrackingDelete,
        apiTrackingUpdate,
        snackbar,
        setSnackbar,
        getRecords,
        projects,
        getProjects,
        apiProjectUpdate,
        apiProjectDelete,
        apiProjectCreate,
        handleClose,
        handleOpen,
        open,
        setOpen,
        getTasks,
        tasks,
        apiTaskCreate,
        apiTaskUpdate,
        apiTaskDelete,
        selectedDate,
        setSelectedDate,
        notifications,
        setNotifications,
        notification,
        setNotification,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataContextProvider };
