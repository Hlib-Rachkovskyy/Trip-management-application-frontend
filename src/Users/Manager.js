
function ManagerHeader({props}){
    return (<header className="Header">
            <nav>
                <button className="choice-btn" onClick={() => props.setView('explore')}>Explore</button>
            </nav>
        </header>
    )
}