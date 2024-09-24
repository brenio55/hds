import React from "react"
import { Cursor, Typewriter } from "react-simple-typewriter"

function MainBanner(){
    return (
        <>
            <section className="mainBanner">
                <div className="flex">
                    <h2><Typewriter 
                        words={["METAIS ROBUSTOS PARA PROJETOS QUE DURAM!"]}
                        loop={5}
                        cursor
                        cursorStyle="|"
                        typeSpeed={60}

                    /></h2>

                    <button className="vermelhoButton">CONHECER</button>
                </div>
            </section>
        </>
    )
}

export default MainBanner