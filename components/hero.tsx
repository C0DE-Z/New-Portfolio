/* eslint-disable @typescript-eslint/no-unused-vars */
import { FaGithub } from "react-icons/fa";
import GridBackground from "./ui/grid-backround";
import TextEffect from "./ui/textEffect";
import { SiLeetcode } from "react-icons/si";

const Hero: React.FC<{ canvasRef: React.RefObject<HTMLCanvasElement> }> = ({ canvasRef }) => {
    return(
        <>
        <GridBackground/>
        <div className="relative grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
          <header className="absolute top-1/3 transform -translate-y-1/2 sm:left-20 text-center sm:text-left">
            <h1 
              className={`text-[4rem] sm:text-[5rem] transition-colors duration-300`}>
              Hello I&apos;m
            </h1>
            <TextEffect title = "Nicholas " desired = "Code-Z" subtitle ="" />

            <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
              <li className="mb-2">
                Full Stack Web-Developer, And Robotics Enthusiast.
              </li>
            </ol>

            <div className="mt-4 mb-2 flex gap-4 items-center flex-col sm:flex-row">
              <a
                className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5"
                href="https://github.com/C0DE-Z"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaGithub className="text-lg" />
                Github
              </a>
              
              <a
                className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44"
                href="https://leetcode.com/C0DE-Z"
                target="_blank"
                rel="noopener noreferrer"
              >
                <SiLeetcode className="text-lg" />
                ‎
                ‎ 
                LeetCode
              </a>
            </div>
          </header>

          <main className="flex flex-col gap-8 row-start-2 sm:items-start">
            <div className="absolute right-0 top-0 w-1/2 h-full">
              <canvas ref={canvasRef} className="w-full h-full"></canvas>
            </div>
          </main>

        </div>
        </>
    )
}
export default Hero;