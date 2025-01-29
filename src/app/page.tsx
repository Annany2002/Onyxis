import { SignOutButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  return (
    <>
      <Link href={"/dashboard"}>Dashboard</Link>
      <SignOutButton />
      <h1 className="text-red-500">Hello World</h1>
    </>
  );
}
