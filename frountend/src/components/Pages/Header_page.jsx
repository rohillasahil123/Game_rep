import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, Wallet } from "lucide-react";
import axios from "axios";


const Header_Page = () => {
  const [menuOpen, setMenuOpen] = useState(false);
   const [walletBalance, setWalletBalance] = useState(null);

useEffect(() => {
  const fetchWalletBalance = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const response = await axios.get("https://foodenergy.shop/v1/wallet/0", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWalletBalance(response.data.balance);
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      setWalletBalance(null);
    }
  };

  fetchWalletBalance();
}, [walletBalance]);


  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Contests", path: "/contests" },
    { name: "How to Play", path: "/how-to-play" },
    { name: "About", path: "/about" },
  ];

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600">
          PreMatchGlobal
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="text-gray-700 hover:text-blue-600 font-medium"
            >
              {link.name}
            </Link>
          ))}
          {/* ✅ Wallet on Desktop */}
          <Link
            to="/wallet"
            className="text-gray-700 hover:text-blue-600 font-medium flex items-center gap-2"
          >
            <Wallet size={18} />
            ₹{walletBalance !== null ? walletBalance : "--"}
          </Link>
        </nav>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex space-x-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-medium"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile Wallet + Hamburger */}
        <div className="md:hidden flex items-center gap-4">
          <Link
            to="/wallet"
            className="text-blue-600 flex items-center gap-1 font-medium"
          >
            <Wallet size={22} />
            ₹{walletBalance !== null ? walletBalance : "--"}
          </Link>
          <button onClick={() => setMenuOpen((prev) => !prev)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
        <div className="md:hidden px-4 pb-4 space-y-3 bg-white shadow">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className="block text-gray-700 hover:text-blue-600 font-medium"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          {/* Auth Buttons */}
          <div className="pt-3 flex flex-col space-y-2">
            <Link
              to="/login"
              className="w-full text-center py-2 border border-blue-600 text-blue-600 rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="w-full text-center py-2 bg-blue-600 text-white rounded-md"
              onClick={() => setMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header_Page;
