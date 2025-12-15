import { NavLink, Outlet } from "react-router-dom";

export const Layout = () => {
  return (
    <div>
      <header className="header">
        <div className="nav">
          <strong>MakotoClub Admin</strong>
          <NavLink to="/stores" className={({ isActive }) => (isActive ? "active" : "") }>
            店舗管理
          </NavLink>
          <NavLink to="/surveys" className={({ isActive }) => (isActive ? "active" : "") }>
            アンケート管理
          </NavLink>
          <NavLink to="/surveys/drafts" className={({ isActive }) => (isActive ? "active" : "") }>
            下書き一覧
          </NavLink>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </div>
  );
};
