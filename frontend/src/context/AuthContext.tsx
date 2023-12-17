// import { createContext, useState, useEffect } from "react";
// import jwt_decode from "jwt-decode";
// import axios from "./axios";

// interface AuthProvider {
//   name: string;
// }

// interface User {
//   exp: number;
//   first_name: string;
//   jti: string;
//   last_name: string;
//   token_type: string;
//   user_id: number;
//   username: string;
// }

// const AuthContext = createContext<AuthProvider>({
//   name: "",
// });

// export default AuthContext;

// export const AuthProvider = ({ children }: Props) => {
//   const ISSERVER = typeof window === "undefined";

//   // let [user, setUser] = useState<User>(() =>
//   //   localStorage.getItem("authTokens")
//   //     ? jwt_decode(JSON.parse(localStorage.getItem("authTokens")).access)
//   //     : null
//   // );

//   // let [authTokens, setAuthTokens] = useState(() =>
//   //   localStorage.getItem("authTokens")
//   //     ? JSON.parse(localStorage.getItem("authTokens"))
//   //     : null
//   // );

//   let [user, setUser] = useState<User>();
//   let [authTokens, setAuthTokens] = useState();

//   // if (ISSERVER) {
//   //   console.log("server");
//   // } else {
//   //   console.log("not server");
//   //   setUser(jwt_decode(JSON.parse(localStorage.getItem("authTokens")).access));
//   //   console.log(user);
//   // }

//   let loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     let response = await fetch("http://localhost:9000/api/login/", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         username: e.target.username.value,
//         password: e.target.password.value,
//       }),
//     });
//     let data = await response.json();
//     if (response.status === 200) {
//       setAuthTokens(data);
//       setUser(jwt_decode(data.access));
//       localStorage.setItem("authTokens", JSON.stringify(data));
//     } else {
//       console.log("Wrong credentials or user not found");
//     }
//   };

//   let contextData = {
//     user: user,
//     loginUser: loginUser,
//   };

//   // useEffect(() => {
//   //   if (localStorage.getItem("authTokens")) {
//   //     setAuthTokens(JSON.parse(localStorage.getItem("authTokens")));
//   //     console.log(
//   //       jwt_decode(JSON.parse(localStorage.getItem("authTokens")).access)
//   //     );
//   //     setUser(
//   //       jwt_decode(JSON.parse(localStorage.getItem("authTokens")).access)
//   //     );
//   //   } else {
//   //     setAuthTokens(null);
//   //     setUser(null);
//   //   }
//   //   console.log("1 " + user);
//   // }, []);

//   // useEffect(() => {
//   //   let isMounted = true;
//   //   const controller = new AbortController();

//   //   const getUser = async () => {
//   //     try {
//   //       const response = await axios.get("/api/login/", {
//   //         signal: controller.signal,
//   //       });
//   //       console.log(response.data);
//   //       isMounted && setUser(response.data);
//   //     } catch (error) {
//   //       console.log(error);
//   //     }
//   //   };

//   //   getUser();

//   //   // cleanup
//   //   return () => {
//   //     isMounted = false;
//   //     controller.abort();
//   //   };
//   // }, []);

//   return (
//     <AuthContext.Provider value={contextData}>{children}</AuthContext.Provider>
//   );
// };
