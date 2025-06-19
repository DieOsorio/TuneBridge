import { FiPlus } from "react-icons/fi"
import { useNavigate } from "react-router-dom"

function PlusButton({ t }) {
  const navigate = useNavigate();
  return (
    <>
    {/* Desktop: Plus icon*/}        
    <div className="items-center mb-4">  
      <div className="relative mb-4 hidden md:flex justify-end items-center">
        <div className="group relative">
          <button
            type="button"
            onClick={() => navigate("/ads/new")}
            className="cursor-pointer text-emerald-500 hover:text-emerald-700 p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
          >
            <FiPlus size={28} />
          </button>

          {/* Slide text*/}
          <span
            className="absolute right-full top-1/2 -translate-y-1/2 ml-2 whitespace-nowrap 
                    text-emerald-500 font-semibold text-base px-3 py-1 rounded-lg shadow 
                      opacity-0 translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 
                      transition-all duration-300 pointer-events-none"
          >
            {t("adsPage.buttons.createAd")}
          </span>
        </div>
      </div>
      {/* Mobile: Plus icon*/}
      <div className="flex items-center md:hidden space-x-2">
          <button
              type="button"
              onClick={() => navigate("/ads/new")}
              className="text-emerald-500 hover:text-emerald-700 cursor-pointer p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-400 transition-colors"
          >
            <FiPlus size={20} />
          </button>
          <span
            onClick={() => navigate("/ads/new")} 
            className="text-emerald-500 hover:text-emerald-700 font-semibold cursor-pointer"
          >
              {t("adsPage.buttons.createAd")}
          </span>
      </div>
    </div>
    </>
  )
}

export default PlusButton