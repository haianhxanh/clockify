import { ReactNode, createContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import * as API from "@/constants/api";

interface UserContextProviderProps {
  children: ReactNode;
}

interface User {
  user_email: string;
  user_id: number;
  user_role: string;
}

const UserContext = createContext<User>({
  user_email: "",
  user_id: 0,
  user_role: "",
});

const UserContextProvider = ({ children }: UserContextProviderProps) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = async () => {
    try {
      const response = await fetch(API.USERS, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          // Authorization: "Bearer " + String(session.data.user.access),
          Authorization: "Bearer " + process.env.ACCESS_TOKEN,
        },
      });
      const data = await response.json();
      setAllUsers((allUsers) => data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <UserContext.Provider
      value={{
        allUsers,
        setAllUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserContextProvider };
