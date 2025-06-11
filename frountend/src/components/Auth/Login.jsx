import { useState } from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";

const Login = () => {
  const [activeTab, setActiveTab] = useState("phone");
  const [showPassword, setShowPassword] = useState(false);

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
          {["phone", "account", "email"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 text-sm capitalize ${
                activeTab === tab ? "bg-gray-100 font-semibold" : "bg-white"
              }`}
            >
              {tab === "phone" && "Phone number"}
              {tab === "account" && "Account number"}
              {tab === "email" && "E-mail"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <div className="relative">
            <span className="absolute left-3 top-3 text-xl">🇮🇳</span>
            <input
              type="tel"
              placeholder="+91 (XXXXX) XXX - XXX"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
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

        <button className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg cursor-not-allowed">
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
