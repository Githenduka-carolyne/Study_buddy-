import React from "react";
import Header from "./header/header";
import Footer from "./footer/footer";
import Navigation from "./Navigation/Navigation";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header - Fixed at top with high z-index */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white shadow">
        <Header />
      </div>
      
      {/* Main content area with navigation and content */}
      <div className="flex flex-1 mt-16"> {/* mt-16 pushes content below header */}
        {/* Navigation - Fixed on left */}
        <div className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg overflow-y-auto z-40">
          <Navigation />
        </div>
        
        {/* Main content and footer container - Takes remaining space */}
        <div className="flex-1 ml-64"> {/* ml-64 to offset the navigation width */}
          <div className="flex flex-col min-h-screen">
            {/* Main content */}
            <main className="flex-1 container mx-auto px-6 py-8">
              {children}
            </main>

            {/* Footer - Full width */}
            <div className="w-full bg-white shadow-lg">
              <div className="container mx-auto px-6">
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
