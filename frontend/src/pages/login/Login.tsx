import AuthContext from "@/context/AuthContext";
import { Avatar } from "@mui/material";
import { useSession, signIn, signOut } from "next-auth/react";
import jwt_decode from "jwt-decode";

const Login = () => {
  const { data: session } = useSession();
  if (session?.user?.access) {
    console.log(session.user.access);
    let user = jwt_decode(session.user.access);
    const userProfileImg = session.user?.image as string;
    // const userName = session.user?.name as string;
    const userName = user.username as string;
    return (
      <div>
        Hi {userName}
        <Avatar alt={userName} src={userProfileImg} />
        <button onClick={() => signOut()}>Sign out</button>
      </div>
    );
  }
  return (
    <div>
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );

  // let { loginUser } = useContext(AuthContext);
  // let { user } = useContext(AuthContext);

  // return (
  //   <div>
  //     {user ? "Hello " + user.username : ""}
  //     <form onSubmit={loginUser}>
  //       <input type="text" name="username" placeholder="username" />
  //       <input type="password" name="password" placeholder="password" />
  //       <input type="submit" />
  //     </form>
  //   </div>
  // );
};

export default Login;
