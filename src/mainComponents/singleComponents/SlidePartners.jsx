function SlidePartners(props){

    let imgSrc = props.imgSrc;
    

    return (
        <>
            <div className="slidePartners">                               
                <div className="slideContentContainer">
                    <img src={imgSrc} alt="" />
                </div>                                            
            </div>
        </>
    )
}

export default SlidePartners