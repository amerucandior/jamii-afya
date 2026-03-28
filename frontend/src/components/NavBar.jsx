// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({ page, setPage, user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-logo" onClick={() => setPage("home")} style={{ cursor: "pointer" }}>
        <div className="logo-pulse">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>
        Jamii-Afya
      </div>
      <div className="navbar-actions">
        {user && (
          <>
            <button className={`nav-btn ${page === "home" ? "active" : ""}`} onClick={() => setPage("home")}>
              🏠 Home
            </button>
            <button className={`nav-btn ${page === "new-claim" ? "active" : ""}`} onClick={() => setPage("new-claim")}>
              + New Claim
            </button>
            <button className={`nav-btn ${page === "history" ? "active" : ""}`} onClick={() => setPage("history")}>
              History
            </button>
            {user.role === "admin" && (
              <button className={`nav-btn ${page === "admin" ? "active" : ""}`} onClick={() => setPage("admin")}>
                Admin <span className="admin-badge">2</span>
              </button>
            )}
            <button className="nav-btn" onClick={onLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
