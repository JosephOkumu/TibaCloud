import React from "react";

const AboutUs = () => {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-blue-500 to-green-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">About Us</h1>
          <p className="text-lg">
            Discover who we are and how we are transforming healthcare for everyone.
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-12 space-y-12">
        {/* Mission Section */}
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            At Afya Mawinguni, our mission is to connect patients, providers, and healthcare services seamlessly through innovative technology. We are committed to improving access to quality healthcare for everyone.
          </p>
        </section>

        {/* Vision Section */}
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Vision</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            To revolutionize healthcare delivery by leveraging technology to create a healthier world.
          </p>
        </section>

        {/* Values Section */}
        <section className="text-center">
          <h2 className="text-3xl font-semibold text-gray-800 mb-4">Our Values</h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            We uphold compassion, innovation, integrity, and excellence in everything we do, ensuring the best outcomes for our users and the communities we serve.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AboutUs;