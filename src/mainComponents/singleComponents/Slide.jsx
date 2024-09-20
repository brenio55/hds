function Slide(props){

    let imgSrc = props.imgSrc;
    let titleSlide = props.titleSlide;

    return (
        <>
            <div className="slideServices">                               
                <div className="slideContentContainer">
                    <img src={imgSrc} alt="" />

                    <div className="slideTitleContainer">
                        <h3>{titleSlide}</h3>
                    </div>                                
                </div>                                            
            </div>
        </>
    )
}

export default Slide