import React from 'react'

function Footer() {
  return (
    <footer className="bg-gradient-to-t from-sky-700 to-sky-900 text-white py-4 mt-8 z-20">
      <div className="container mx-auto text-center">
        <p>&copy; {new Date().getFullYear()} TuneBridge. All rights reserved.</p>
        <p>Follow us on social media!</p>
        <div className="flex justify-center space-x-4 mt-2">
          <a href="#" className="text-gray-300 hover:text-white">Facebook</a>
          <a href="#" className="text-gray-300 hover:text-white">Twitter</a>
          <a href="#" className="text-gray-300 hover:text-white">Instagram</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer