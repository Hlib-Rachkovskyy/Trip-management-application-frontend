
function UserHeader({props}){
    return (<header className="Header">
        <nav>
            <button className="choice-btn" onClick={() => props.setView('explore')}>Explore</button>
            <button className="choice-btn" onClick={() => props.setView('registered')}>Trips on which is
                registered
            </button>
            <button className="choice-btn" onClick={() => props.setView('form')}>Write to organiser
            </button>
        </nav>
    </header>)
}