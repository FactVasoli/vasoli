"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <nav style={styles.navBar}>
      <div style={styles.brand}>Mi Aplicación</div>
      <div style={styles.navLinks}>
        <Link href="/login" style={styles.link}>
          Login
        </Link>
        <Link href="/register" style={styles.link}>
          Register
        </Link>
      </div>
    </nav>
  );
}

const styles = {
  navBar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#333",
    color: "#fff",
  },
  brand: {
    fontSize: "20px",
    fontWeight: "bold",
  },
  navLinks: {
    display: "flex",
    gap: "10px",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    padding: "5px 10px",
    border: "1px solid #fff",
    borderRadius: "5px",
  },
};
