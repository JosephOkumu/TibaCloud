import { Link } from "react-router-dom";

function AboutUs() {
  return (
    <div className="bg-custom-white min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <section className="mb-12 text-center bg-gradient-to-r from-primary-blue to-secondary-green text-custom-white p-8 rounded-lg shadow-md">
          <h1 className="text-4xl font-bold mb-4">About Us</h1>
          <p className="text-lg mb-4">Your complete healthcare experience—online.</p>
          <p className="leading-relaxed">
            Afia Mawinguni is an all-in-one digital platform that brings hospital services directly to your home. Whether you’re booking an online specialist, ordering prescription medicine, scheduling a home nurse visit, or requesting lab sample collection—Afia Mawinguni makes it fast, easy, and accessible.
          </p>
        </section>

        {/* Story Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-secondary-green">Bringing Healthcare Home – The Afia Mawinguni Story</h2>
          <p className="text-custom-dark leading-relaxed">
            At Afia Mawinguni, we believe that access to quality healthcare should be simple, affordable, and within reach of every Kenyan—no matter where they are. Our name, Mawinguni, meaning "in the clouds," reflects our mission: to make hospital-grade care accessible online, through a seamless and trustworthy platform.
          </p>
        </section>

        {/* What We Do Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-secondary-green">What We Do</h2>
          <p className="text-custom-dark leading-relaxed">
            Afia Mawinguni is a full-service digital healthcare platform that transforms how patients and providers interact. We connect patients with top specialists, offer online pharmaceutical shopping, and make it easy to book home-based nursing care or lab sample collection—all from the comfort of home.
          </p>
          <p className="text-custom-dark leading-relaxed mt-2">
            But we also go further. We support healthcare professionals behind the scenes by offering:
          </p>
          <ul className="list-disc list-inside text-custom-dark pl-2 mt-2">
            <li>Medical billing services to streamline payment processes</li>
            <li>Hospital credentialing support to ensure compliance and professional access</li>
            <li>Tools to expand patient reach and grow profitability</li>
          </ul>
          <p className="text-custom-dark leading-relaxed mt-2">
            Whether you’re a patient seeking convenience and care or a medical specialist building a practice, Afia Mawinguni is designed to support you.
          </p>
        </section>

        {/* Why We Exist Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-secondary-green">Why We Exist</h2>
          <p className="text-custom-dark leading-relaxed">
            Healthcare in Kenya is evolving—and we’re here to lead that transformation. Long queues, travel challenges, and limited specialist access shouldn’t be barriers to wellness. Afia Mawinguni was created to close that gap by delivering healthcare with the same standards you'd expect in a hospital, but with the ease of digital access.
          </p>
        </section>

        {/* Vision and Mission */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-2xl font-semibold mb-3 text-primary-blue">Our Vision</h3>
            <p className="text-custom-dark">
              To create a connected healthcare ecosystem that empowers both patients and providers, wherever they are.
            </p>
          </div>
          <div className="bg-gray-100 p-6 rounded-lg shadow-sm">
            <h3 className="text-2xl font-semibold mb-3 text-primary-blue">Our Mission</h3>
            <p className="text-custom-dark">
              To make reliable, affordable, and holistic healthcare accessible to all through innovation, empathy, and collaboration.
            </p>
          </div>
        </section>

        {/* Services for Patients and Providers */}
        <section className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-primary-blue">For Patients:</h3>
            <ul className="list-disc list-inside text-custom-dark pl-2">
              <li>Access certified specialists online</li>
              <li>Order pharmaceutical products for delivery</li>
              <li>Book home-based care and lab sample pick-up</li>
              <li>Receive consistent, quality healthcare without leaving your home</li>
            </ul>
          </div>
          <div>
            <h3 className="text-2xl font-semibold mb-4 text-primary-blue">For Healthcare Providers:</h3>
            <ul className="list-disc list-inside text-custom-dark pl-2">
              <li>Get help with medical billing and hospital credentialing</li>
              <li>Reach more patients with less admin stress</li>
              <li>Grow your practice and increase profitability</li>
            </ul>
          </div>
        </section>

        {/* Services for Healthcare Providers */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold mb-4 text-secondary-green">Services for Healthcare Providers</h2>
          <p className="text-custom-dark leading-relaxed mb-4">
            Afia Mawinguni empowers doctors, nurses, and lab technicians by connecting them directly with patients who need their expertise.
          </p>
          <ul className="list-disc list-inside text-custom-dark space-y-2">
            <li><strong>Doctors</strong>: Conduct online consultations, manage appointments, and provide expert care from anywhere.</li>
            <li><strong>Nurses</strong>: Offer home visits for personalized care, from routine checkups to specialized treatments.</li>
            <li><strong>Laboratories</strong>: Streamline sample collection and report delivery for patients at home.</li>
          </ul>
        </section>

        {/* Closing Statement */}
        <section className="text-center mb-12">
          <p className="text-lg font-medium text-custom-dark mb-4">
            Afia Mawinguni isn’t just a service—it’s a smarter way to experience healthcare.
          </p>
          <p className="text-xl font-bold text-primary-blue">
            🔹 Reliable. Convenient. Kenyan. 🔹
          </p>
        </section>

        {/* Closing Section */}
        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link to="/" className="inline-block px-6 py-3 bg-primary-blue text-custom-white font-medium rounded-md hover:bg-blue-700 transition duration-300">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AboutUs;
