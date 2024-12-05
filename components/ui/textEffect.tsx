import { useRef, useEffect, useState } from 'react';

interface Text {
    title: string;
    desired: string;
    subtitle: string;
}

const TextEffect: React.FC<Text> = ({ title, desired, subtitle }) => {
  const mainRef = useRef<HTMLHeadingElement>(null);
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()";
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (mainRef.current) {
      let iteration = 0;
      const main = mainRef.current;
      const targetText = hovered ? desired : title;
      const interval = setInterval(() => {
        main.innerText = main.innerText
          .split("")
          .map((letter, index) => {
            if (index < iteration) {
              return targetText[index];
            }
            return letters[Math.floor(Math.random() * letters.length)];
          })
          .join("");

        if (iteration >= targetText.length) {
          clearInterval(interval);
        }

        iteration += 1 / 3;
      }, 30);

      return () => clearInterval(interval);
    }
  }, [desired, hovered, title]);

  return (
    <>
      <h1 
        ref={mainRef}
        data-value="Code-Z"
        className={`text-[3rem] sm:text-[4rem] transition-colors duration-300`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {hovered ? desired : title}
      </h1>
      {subtitle && (
          <h2 className="text-[1.5rem] sm:text-[2rem] transition-colors duration-300">{subtitle}</h2>
      )}
    </>
  );
};

export default TextEffect;