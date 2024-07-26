import { Outlet, Navigate, Route, Routes, useLocation } from "react-router-dom";
function Layout() {
  const user = null;
  const location = useLocation();

  return user?.token ? (
    <Outlet />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  );
}
function App() {
  return (
    <div className=" w-full min-h-[100vh] bg-bgColor">
      <p className=" text-blue">hi</p>
    </div>
  );
}

export default App;
