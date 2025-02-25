import { motion } from 'framer-motion';
import { FaGithub, FaGamepad, FaCode, FaMicrochip, FaStar, FaGlobe } from 'react-icons/fa';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import styles from '../ui/Card.module.css';

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
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.02 }}
    >
      {image && (
        <motion.img 
          src={image}
          alt={title}
          className={styles.cardImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        />
      )}
      
      {badge && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className={styles.badge}>
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

      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <motion.button 
        className={styles.button}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.open(link, '_blank')}
      >
        {btn}
      </motion.button>
    </motion.div>
  );
};

export default Card;