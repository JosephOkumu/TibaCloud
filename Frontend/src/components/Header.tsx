import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import AuthButton from "./auth/AuthButton";
import { useEffect } from "react";

const Header = () => {
  const location = useLocation();

  const scrollToSection = (id: string) => {
    // First, check if we're on the home page
    if (location.pathname !== "/") {
      // If not, navigate to home page with the hash
      window.location.href = `/#${id}`;
      return;
    }

    // If already on home page, scroll to the section
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };
  return (
    <header className="bg-custom-white shadow-sm">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <span className="text-xl font-bold">
              <span className="text-primary-blue">TIBA</span>
              <span className="text-secondary-green"> CLOUD</span>
            </span>
          </Link>

          {/* Right side navigation and buttons */}
          <div className="flex items-center gap-6">
            {/* Navigation Links */}
            <button
              onClick={() => scrollToSection("services")}
              className="text-custom-dark hover:text-primary-blue font-medium"
            >
              Services
            </button>
            <button
              onClick={() => scrollToSection("accounts")}
              className="text-custom-dark hover:text-primary-blue font-medium"
            >
              Accounts
            </button>
            <Link
              to="/about-us"
              className="text-custom-dark hover:text-primary-blue font-medium"
            >
              About Us
            </Link>

            {/* Sign In Button */}
            <AuthButton />

            {/* Register Button */}
            <AuthButton defaultTab="signup">Register</AuthButton>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;
