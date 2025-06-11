import { useState } from "react";
import { FcGoogle } from "react-icons/fc";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { FaPlus } from "react-icons/fa";

const Signup = () => {
  const [tab, setTab] = useState("phone");
  const [showPassword, setShowPassword] = useState(false);
  const [promoVisible, setPromoVisible] = useState(false);
  const [agree, setAgree] = useState(false);

  const [form, setForm] = useState({
    phone: "",
    email: "",
    password: "",
    promo: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isFormValid =
    (tab === "phone" ? form.phone.length >= 10 : form.email.includes("@")) &&
    form.password.length >= 4 &&
    agree;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-center mb-4">Sign up</h2>

        {/* Google Button */}
        <button className="w-full flex items-center justify-center gap-2 border border-gray-300 py-2 rounded-lg hover:bg-gray-100">
          <FcGoogle size={20} /> Continue with Google
        </button>

        {/* OR divider */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-gray-300" />
          <span className="px-2 text-gray-400 text-sm">or</span>
          <hr className="flex-grow border-gray-300" />
        </div>

        {/* Tabs */}
        <div className="flex mb-4 border border-gray-200 rounded-xl overflow-hidden">
          {["phone", "email"].map((option) => (
            <button
              key={option}
              onClick={() => setTab(option)}
              className={`flex-1 py-2 text-sm font-medium ${
                tab === option ? "bg-gray-100" : "bg-white text-gray-500"
              }`}
            >
              {option === "phone" ? "Phone" : "E-mail"}
            </button>
          ))}
        </div>

        {/* Welcome Bonus Box */}
        <div className="bg-gradient-to-r from-blue-900 to-blue-600 text-white p-3 rounded-lg mb-3 text-sm font-medium text-center">
          🎁 Choose Your Welcome Bonus
        </div>

        {/* Phone or Email input */}
        {tab === "phone" ? (
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
        ) : (
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email address"
            className="w-full px-3 py-2 mb-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
          />
        )}

        {/* Password Field */}
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

        {/* Promo Code Toggle */}
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

        {/* Terms and Conditions */}
        <label className="flex items-start gap-2 mb-4 bg-gray-100 rounded-lg p-3 text-xs text-gray-700 cursor-pointer">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-1"
          />
          <span>
            By signing up, I hereby confirm that I am over 18, I read and accepted the{" "}
            <a href="#" className="text-green-600 underline">
              offer agreements
            </a>{" "}
            for the chosen currency with the applicable terms and conditions
          </span>
        </label>

        {/* Sign Up Button */}
        <button
          disabled={!isFormValid}
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
