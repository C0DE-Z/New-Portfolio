import { motion } from 'framer-motion'; // Import Framer Motion

export default function GridBackground() {
  return (
<motion.div
          className="absolute inset-0"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage: `
              linear-gradient(to right, rgba(128, 128, 128, 0.05) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(128, 128, 128, 0.05) 1px, transparent 1px)
            `,
          }}
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 60,
            ease: "linear",
            repeat: Infinity,
          }}
        />
  )
}