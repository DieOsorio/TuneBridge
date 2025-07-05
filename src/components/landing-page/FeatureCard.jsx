import { motion } from "framer-motion";

const FeatureCard = ({ title, description, svgSrc, index }) => {
  return (
    <motion.div
      className="bg-gray-900 shadow-lg rounded-2xl p-6 flex flex-col items-center text-center border border-amber-700"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{
        duration: 0.6,
        ease: "easeOut",
        delay: index * 0.15,
      }}
    >
      <div className="w-36 h-36 mb-4">
        <img
          src={svgSrc}
          alt={title}
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      <h3 className="text-xl font-bold text-amber-700 mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </motion.div>
  );
};

export default FeatureCard;
