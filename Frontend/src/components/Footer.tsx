import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-custom-dark text-custom-white mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="font-bold text-lg mb-4">Tiba Cloud</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="hover:text-gray-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Features
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Accounts
                </Link>
              </li>
            </ul>
          </div>

          {/* For Patients */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Patients</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Find a Doctor
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Medical Records
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Telemedicine
                </Link>
              </li>
            </ul>
          </div>

          {/* For Providers */}
          <div>
            <h3 className="font-bold text-lg mb-4">For Providers</h3>
            <ul className="space-y-2">
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Provider Registration
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Practice Management
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Patient Coordination
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-gray-300">
                  Billing
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Us */}
          <div>
            <h3 className="font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li>info@tibacloud.com</li>
              <li>Support Center</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-sm">
          <p> 2025 Tiba Cloud. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
