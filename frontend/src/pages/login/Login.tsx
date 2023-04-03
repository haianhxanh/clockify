import { Avatar } from "@mui/material";
import { useSession, signIn, signOut } from "next-auth/react";

const Login = () => {
  const { data: session } = useSession();

  if (session) {
    const userProfileImg = session.user?.image as string;
    const userName = session.user?.name as string;
    return (
      <>
        Hi {session.user?.name}
        <Avatar alt={userName} src={userProfileImg} />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <div>
      Not signed in
      <button onClick={() => signIn()}>Sign in</button>
    </div>
  );
};

export default Login;
