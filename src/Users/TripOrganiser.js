
function OrganiserHeader({props}) {

    return (<header className="Header">
        <nav>
            <button className="choice-btn" onClick={() => {
                props.setPopup('create-trip');
                props.setManagementState(null)}
            }>Create trip</button>
            <button className="choice-btn" onClick={() => {
                props.setView('trips-created');
                props.setManagementState(null) }
            }>Trips</button>
            <button className="choice-btn" onClick={() => {
                props.setView('form');
                props.setManagementState(null)}
            }>View written forms</button>
            {props.view === 'tourist-services' &&
                (<h1 className='black'>You currently viewing tourist service for trip: {props.touristServices.name}</h1>)}
        </nav>
    </header>)

}