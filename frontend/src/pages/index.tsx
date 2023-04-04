import Head from "next/head";
import { Inter } from "next/font/google";
import Dashboard from "./dashboard";
import Header from "../components/Header/Header";
import SideMenu from "../components/SideMenu/SideMenu";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <>
      <Head>
        <title>Clockify</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Header />
        <Dashboard />
        <SideMenu />
      </main>
    </>
  );
}
