import Header from "./Header";
import Sidebar from "./Sidebar";
import StatusBar from "./StatusBar";

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main" role="main" id="main-content">
          {children}
        </main>
      </div>
      <StatusBar />
    </div>
  );
}