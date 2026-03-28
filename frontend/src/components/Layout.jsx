// src/components/Layout.jsx
import { useState, useCallback } from "react";
import Navbar from "./NavBar";
import Snackbar from "./SnackBar";
import { SnackContext } from "../context/SnackContext";

export default function Layout({ children }) {
  const [snack, setSnack] = useState({ msg: "", type: "" });

  const showSnack = useCallback(
    (msg, type = "success") => setSnack({ msg, type }),
    []
  );

  return (
    <SnackContext.Provider value={showSnack}>
      <div className="app-shell">
        <Navbar />
        <main style={{ flex: 1 }}>
          {children}
        </main>
      </div>
      <Snackbar
        msg={snack.msg}
        type={snack.type}
        onClose={() => setSnack({ msg: "", type: "" })}
      />
    </SnackContext.Provider>
  );
}