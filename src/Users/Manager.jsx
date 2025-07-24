import { PostList } from "../Utils";

export function ManagerHeader({props}){
    return (<header className="Header">
            <nav>
                <button className="choice-btn" onClick={() => props.setView('explore')}>Explore</button>
            </nav>
        </header>
    )
}



export function AnnouncementsWriteOnly({ props }) {
    return (
        <>
            <select className='select-container' id="company" name="company">
                <option value="Trip1">Trip1</option>
                <option value="Trip1">Trip1</option>
                <option value="Trip1">Trip1</option>
            </select>
            <div>
                <label htmlFor="fname">Text:</label>
                <input className='input-container' type="text" id="form" name="form"/><br/><br/>
                <button className="submit">Submit</button>
            </div>
        </>)
}

export function ManagerView({props}){
    return (<>
        {props.view === 'explore' && (<PostList props={props}/>)}
        {props.view === 'add-announcement' && (<AnnouncementsWriteOnly props={props}/>)}

    </>)
}
