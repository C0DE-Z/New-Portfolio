
import { motion } from 'framer-motion';

import styles from '../ui/Card.module.css';

interface CardProps {
  title: string;
  description: string;
  link: string;
  btn: string;
}

const Card: React.FC<CardProps> = ({ title, description, link, btn }) => {
  return (
    <motion.div 
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05 }}
    >
      <h2>{title}</h2>
      <p>{description}</p>
      <motion.button 
        className={styles.button}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => window.open(link, '_blank')}
      >
        {btn || 'Learn More'} </motion.button>
    </motion.div>
  );
};

export default Card;