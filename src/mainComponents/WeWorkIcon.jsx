function WeWorkIcon(props){
    let WeWorkTitle = props.WeWorkTitle;
    let WeWorkDescription = props.WeWorkDescription;
    let WeWorkImgSrc = props.WeWorkImgSrc;

    return (
        <>
        <div className="flex WeWorkIcon">
            <div className="flex mainIcon">
                <div className="flex">
                    <img src={WeWorkImgSrc} alt="" />
                </div>
                <div className="flex WeWorkTitleDesc">
                    <h3>{WeWorkTitle}</h3>
                    <p>{WeWorkDescription}</p>
                </div>
            </div>
        </div>
        </>
    )
}

export default WeWorkIcon