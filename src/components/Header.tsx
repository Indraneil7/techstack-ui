import React from 'react';

interface HeaderProps {
  title?: string;
  description?: string;
}

const Header: React.FC<HeaderProps> = ({ 
  title = "Modern Tech Stack Guide",
  description = "Explore how traditional and AI-powered tools are shaping the future of product development. Compare conventional approaches with emerging AI solutions across different industries and project types."
}) => {
  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {title}
        </h1>
        <p className="mt-2 text-gray-600 max-w-3xl">
          {description}
        </p>
      </div>
    </header>
  );
};

export default Header;