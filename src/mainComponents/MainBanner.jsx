import React from "react"
import { Cursor, Typewriter } from "react-simple-typewriter"

function MainBanner(){
    return (
        <>
            <section className="mainBanner">
                <div className="flex">
                    <h2>
                      <div className="typeWriter">
                        <span className="typeSpan">
                      
                        <Typewriter 
                        words={[                           
                            "UM RESULTADO JUSTO PARA NOSSA EMPRESA E SATISFATÓRIO PARA NOSSO CLIENTE",
                            "ÉTICA, EFICIÊNCIA, SEGURANÇA, E QUALIDADE DENTRO E FORA DAS OBRAS!",
                            "VAMOS UNIR PROPÓSITOS? JUNTE-SE À HDS NESSA!"
                        ]}
                        loop
                        cursor
                        cursorStyle="|"
                        typeSpeed={50}
                    />
                        </span>
                    </div>
                    </h2>

                    <button className="vermelhoButton">CONHECER</button>
                </div>
            </section>
        </>
    )
}

export default MainBanner