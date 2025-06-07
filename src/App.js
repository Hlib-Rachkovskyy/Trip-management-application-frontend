import {useState} from "react";


function User(){
    const [listType, setListTypes] = useState('explore'); // registered, form
    const [popupState, setPopupState] = useState(null); // expand, announcement
    const [popupData, setPopupData] = useState([]);

    /* explore */
    const props = {type: listType, setType: setListTypes, popupState, popupData, setPopupState, setPopupData }
    return(
        <>
            <header className="Header">
                <nav>
                    <button className="choice-btn" onClick={() => setListTypes('explore')}>Explore</button>
                    <button className="choice-btn" onClick={() => setListTypes('registered')}>Trips on which is
                        registered
                    </button>
                    <button className="choice-btn" onClick={() => setListTypes('form')}>Write to organiser
                    </button>

                </nav>
            </header>
            <main>
                {listType !== 'form' && (<View props={props}/>)}
                {listType === 'form' && (<FormView props={props}/>)}

                {popupState === 'expand' && (<Popup props={props}/>)}

            </main>
        </>
    )
}

function FormView({props}){
    return(<div className='form-container'>
        <label htmlFor="company">Choose a company:</label>
        <select className='select-container' id="company" name="company">
            <option value="company1">company1</option>
            <option value="company2">company2</option>
            <option value="company3">company3</option>
        </select>
        <label htmlFor="fname">Text:</label>
        <input className='input-container' type="text" id="form" name="form"/><br/><br/>
        <button className="submit">Submit</button>
    </div>)
}

function View({props}) {
    if (props.type === 'explore') {
    } else if (props.type === 'registered') {

    }

    const items = [];
    for (let i = 0; i < 30; i++) { // need input data as list
        items[i] = <PostBlock props={props} inputdata={i + '123'}/>
    }
    return (
        <div className="container-list">
            {items}
        </div>
    )
}

function PostBlock({ props, inputdata }){
    return(<div className="container">
                <h5>{ inputdata }</h5>
                <p>{ inputdata }</p>
                <button className='choice-btn' onClick={ () => {
                    props.setPopupData([inputdata]);
                    props.setPopupState('expand');
                }}>Expand</button>
            {props.type === 'registered' && <button className='choice-btn' id="resing">Resign</button>}
            {props.type === 'explore' && <button className='choice-btn' id="apply">Apply</button>}
        </div>
    )
} // make loader in future



export default User;


function Popup({props}) {
    return (
        <div className="popup">
            <div className="popup-content">
                <button className="choice-btn" onClick={() => props.setPopupState(false)}>Close</button>
                {props.popupData}
                {props.type === 'registered' &&
                    (<button className='choice-btn' id="apply" onClick={() =>
                        props.setPopupState('announcement')}>See announcements</button>)}

            </div>
        </div>
    );
}