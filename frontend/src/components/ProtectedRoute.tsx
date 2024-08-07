// components/ProtectedRoute.tsx
import React from "react";
import { Route, Navigate, Outlet } from "react-router-dom";

interface ProtectedRouteProps {
  element: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ element }) => {
  const token = localStorage.getItem("token");

  return token ? element : <Navigate to="/error" />;
};
