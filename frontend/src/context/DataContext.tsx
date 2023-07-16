import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import * as API from "@/constants/api";
import * as SNACKBAR from "@/constants/snackbar";

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
  const [records, setRecords] = useState<TimeRecordProps[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    status: "success",
    message: "",
  });

  useEffect(() => {
    getRecords();
  }, []);

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

  const apiTrackingDelete = async (id: number) => {
    try {
      const response = await fetch(`${API.TRACKING_DELETE}${id}/`, {
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
          status: SNACKBAR.SNACKBAR_STATUS.SUCCESS,
          message: SNACKBAR.SNACKBAR_MESSAGE.DELETED,
        });
      }

      getRecords();
      console.log("deleted");
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
      setTimeout(() => {
        getRecords();
        console.log("updated");
      }, 3000);
    }
  };

  return (
    <DataContext.Provider
      value={{
        records,
        setRecords,
        apiTrackingDelete,
        apiTrackingUpdate,
        snackbar,
        setSnackbar,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export { DataContext, DataContextProvider };
