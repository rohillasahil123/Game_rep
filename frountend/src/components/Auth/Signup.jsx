import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";


const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [promoVisible, setPromoVisible] = useState(false);
  const [agree, setAgree] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    promo: ""
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid =
    form.fullName.length >= 3 &&
    form.phone.length >= 10 &&
    form.email.includes("@") &&
    form.password.length >= 4 &&
    agree;

  const handleSignup = async () => {
    try {
      const { fullName, phone, email, password } = form;

      const response = await axios.post(`https://foodenergy.shop/v1/signup`, {
        fullName,
        phone,
        email,
        password,
      });

      localStorage.setItem("fullName", fullName);
      toast.success("Signup successful!");
      navigate("/login");
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Signup failed!");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-center mb-4">Sign up</h2>

        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100">
          <FcGoogle size={20} /> Continue with Google
        </button>

        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-3 rounded-lg mb-3 text-sm font-medium text-center">
          🎁 Choose Your Welcome Bonus
        </div>

        <input
          name="fullName"
          type="text"
          value={form.fullName}
          onChange={handleChange}
          placeholder="Full Name"
          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />

        <div className="relative mb-3">
          <span className="absolute left-3 top-2.5">🇮🇳</span>
          <input
            name="phone"
            type="tel"
            value={form.phone}
            onChange={handleChange}
            placeholder="+91 (XXXXX) XXX - XXX"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
        </div>

        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email address"
          className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
        />

        <div className="relative mb-1">
          <input
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-3 pl-1">• at least 4 characters</p>

        <div
          className="flex items-center gap-2 text-green-600 font-medium cursor-pointer mb-3"
          onClick={() => setPromoVisible(!promoVisible)}
        >
          <FaPlus size={12} /> I Have a Promo Code
        </div>
        {promoVisible && (
          <input
            name="promo"
            type="text"
            value={form.promo}
            onChange={handleChange}
            placeholder="Enter Promo Code"
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
        )}

        <label className="flex items-start gap-2 mb-4 bg-gray-100 rounded-lg p-3 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1"
          />
          <span>
            By signing up, I confirm that I am over 18 and I accept the{" "}
            <a href="#" className="text-green-600 underline">
              terms and conditions
            </a>
          </span>
        </label>

        <button
          disabled={!isFormValid}
          onClick={handleSignup}
          className={`w-full py-2 rounded-lg font-medium transition ${
            isFormValid
              ? "bg-green-500 text-white hover:bg-green-600"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          Sign up
        </button>
      </div>
    </div>
  );
};

export default Signup;
