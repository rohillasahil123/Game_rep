import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import toast from "react-hot-toast";

const Login = () => {
  const [activeTab, setActiveTab] = useState("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ phone: "", email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      const payload =
        activeTab === "phone"
          ? { phone: form.phone, password: form.password }
          : { email: form.email, password: form.password };

      const response = await axios.post("http://localhost:5000/login", payload);

      toast.success("Login successful!");
       if (res.data.token) {
    localStorage.setItem("token", res.data.token); 
  }
      
      navigate("/"); 
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    }
  };

  const isValid =
    form.password.length >= 4 &&
    ((activeTab === "phone" && form.phone.length >= 10) ||
      (activeTab === "email" && form.email.includes("@")));

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm p-6 bg-white rounded-xl shadow-md">
        <h2 className="text-center text-lg font-semibold mb-4">Log in</h2>

        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100 transition">
          <FcGoogle size={20} />
          Continue with Google
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-500 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="flex mb-4 border border-gray-300 rounded-lg overflow-hidden">
          {["phone", "email"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm capitalize ${
                activeTab === tab ? "bg-gray-100 font-semibold" : "bg-white"
              }`}
            >
              {tab === "phone" ? "Phone number" : "E-mail"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {activeTab === "phone" ? (
            <div className="relative">
              <span className="absolute left-3 top-3 text-xl">🇮🇳</span>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 (XXXXX) XXX - XXX"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
          ) : (
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          )}

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full pr-10 py-2 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-500 cursor-pointer"
            >
              {showPassword ? <AiOutlineEyeInvisible size={20} /> : <AiOutlineEye size={20} />}
            </span>
          </div>
        </div>

        <div className="mt-2 mb-4 text-right">
          <Link to="/forgot-password" className="text-green-600 text-sm font-medium">
            Forgot your password?
          </Link>
        </div>

        <button
          onClick={handleLogin}
          disabled={!isValid}
          className={`w-full py-2 rounded-lg font-medium transition ${
            isValid
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Log in
        </button>

        <p className="text-center mt-4 text-sm">
          Don’t have an account?{" "}
          <Link to="/signup" className="text-green-600 font-semibold">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
