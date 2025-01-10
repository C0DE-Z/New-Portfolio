"use client"
import Card from "../../components/ui/card";
import GridBackground from "../../components/ui/grid-backround";
import TextEffect from "../../components/ui/textEffect";

export default function games() {
    return (
        <>
    <section>
        <GridBackground />
        <TextEffect  title = "Games " desired = "" subtitle ="" />
        <Card 
                  title="Loaf Game"
                  description="A Game that is planned to come out soon its a roblox game about the famous cat model Dingus aka maxwell where he can race against other players, This is made with Morning Dove Developement team."
                  link=""
                  btn = "View"
                />
        <Card 
                  title="Untitled Soccer Game"
                  description="Another Roblox game that I personally made with some friends to have fun! "
                  link=""
                  btn = "View"
                />
        <Card 
                  title="Free-Runner"
                  description="A movement based open city game made in unity made in a week for a game jam"
                  link=""
                  btn = "View"
                />
          <Card 
                  title="Pixel Racer"
                  description="A 2D racing game made in unity made in a week for a final"
                  link=""
                  btn = "Source"
                />
     </section>
   </>
    )
}   