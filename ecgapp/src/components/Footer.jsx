import React from "react";

function Footer() {
  return (
    <footer className="bg-gray-200 text-center p-4 mt-8">
      © {new Date().getFullYear()} ECG Diagnosis. All rights reserved.
    </footer>
  );
}

export default Footer;