import { motion } from 'framer-motion';
import { FaGithub, FaGamepad, FaCode, FaMicrochip, FaStar, FaGlobe } from 'react-icons/fa';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface CardProps {
  title: string;
  description: string;
  link: string;
  btn: string;
  badge?: string;
  tooltipText?: string;
  image?: string;
}

const getBadgeIcon = (badge: string) => {
  switch (badge) {
    case 'GitHub': return <FaGithub />;
    case 'Games': return <FaGamepad />;
    case 'Mod': return <FaCode />;
    case 'Hardware': return <FaMicrochip />;
    case 'Featured': return <FaStar />;
    case 'Web App': return <FaGlobe />;
    default: return null;
  }
};

const getBadgeTooltip = (badge: string) => {
  switch (badge) {
    case 'Featured': return "One of my featured projects";
    case 'Games': return "Gaming-related project";
    case 'Mod': return "Modification or plugin project";
    case 'Hardware': return "Hardware/Physical project";
    case 'Web App': return "Web application project";
    default: return "Project badge";
  }
};

const Card: React.FC<CardProps> = ({ 
  title, 
  description, 
  link, 
  btn, 
  badge, 
  tooltipText, 
  image 
}) => {
  return (
    <motion.div 
      className="relative bg-neutral-900/60 backdrop-blur-md p-6 rounded-xl border border-neutral-800/80 flex flex-col gap-4 overflow-hidden min-h-[280px]"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, borderColor: "rgba(255, 255, 255, 0.15)" }}
    >
      {image && (
        <motion.img 
          src={image}
          alt={title}
          className="w-full h-48 rounded-lg object-cover mb-4 bg-neutral-800/50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
      )}
      
      {badge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="absolute top-4 right-4 px-3 py-1 bg-neutral-800/40 backdrop-blur-sm border border-neutral-700/50 text-neutral-300 text-xs font-medium rounded-full flex items-center gap-1.5">
                {getBadgeIcon(badge)}
                {badge}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tooltipText || getBadgeTooltip(badge)}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      <h2 className="text-xl font-semibold text-neutral-100 mb-2">{title}</h2>
      <p className="text-neutral-400 text-sm leading-relaxed">{description}</p>
      <motion.button 
        className="mt-auto px-4 py-2 rounded-lg bg-neutral-800/60 border border-neutral-700/50 text-neutral-200 hover:bg-neutral-700/80 hover:text-white transition-all duration-300 text-sm"
        whileTap={{ scale: 0.98 }}
        onClick={() => window.open(link, '_blank')}
      >
        {btn}
      </motion.button>
    </motion.div>
  );
};

export default Card;