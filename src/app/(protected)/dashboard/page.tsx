"use client";

import { useUser } from "@clerk/nextjs";

const DashboardPage = () => {
  const { user } = useUser();

  return <div>{user?.fullName}</div>;
};

export default DashboardPage;
