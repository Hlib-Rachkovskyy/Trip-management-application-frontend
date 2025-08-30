import {useEffect, useState} from "react";
import './App.css';
import {UserHeader, UserView} from "./Users/User";
import {OrganiserHeader, OrganiserView} from "./Users/TripOrganiser";
import {ManagerHeader, ManagerView} from "./Users/Manager";
import {Popup, TouristServicesList} from "./Utils";

function App(){
    const [currentUserId, setCurrentUserId] = useState(1);
    const [userType, setUserType] = useState('option');

    const [view, setView] = useState('option');

    const [popup, setPopup] = useState(null);

    const [popupData, setPopupData] = useState(null);
    const [blockStateUser, setBlockStateUser] = useState(true);

    const [userData, setUserData] = useState({});
    const [id, setId] = useState(0);
    const [currentElementId, setCurrentElementId] = useState(0);
    const [updateData, setUpdateData] = useState(true);
    const [refetchFunction, setRefetchFunction] = useState(null);
    const [currentTouristService, setCurrentTouristService] = useState(null);
    const [currentOptionService, setCurrentOptionService] = useState(null);
    const [addOption, setAddOption] = useState('');

    const props = {
        id, setId,
        currentUserId, setCurrentUserId,
        userType, setUserType,

        view, setView,

        popup, setPopup,
        popupData, setPopupData,

        blockStateUser, setBlockStateUser,
        userData, setUserData,
        currentElementId, setCurrentElementId,
        updateData, setUpdateData,
        refetchFunction, setRefetchFunction,
        addOption, setAddOption,
        currentTouristService, setCurrentTouristService,
        currentOptionService, setCurrentOptionService
    }

    return (
        <div className="App">
            {userType === 'user' && (<UserHeader props={props}/>)}
            {userType === 'organiser' && (<OrganiserHeader props={props}/>)}
            {userType === 'manager' && (<ManagerHeader props={props}/>)}
            {userType === 'option' && (<OptionHeader props={props}/>)}
            <main>
                {userType === 'user' && (<UserView props={props}/>)}
                {userType === 'organiser' && (<OrganiserView props={props}/>)}
                {userType === 'manager'&& (<ManagerView props={props}/>)}
                {props.popup !== null && (<Popup props={props}/>)}
            </main>
        </div>);
}

function OptionHeader({props}){
    const handleUserAssign  = (userType) => {
        switch (userType) {
            case 'organiser':
                props.setCurrentUserId(1)
                props.setUserType(userType);
                break;
            case 'user':
                props.setCurrentUserId(1)
                props.setUserType(userType);
                break;
            case 'manager':
                props.setCurrentUserId(2)
                props.setUserType(userType);
                break;
        }
    }
    return (
        <header className="Header">
            <nav>
                <button className="choice-btn" onClick={() => { handleUserAssign('user')}}>User</button>
                <button className="choice-btn" onClick={() => { handleUserAssign('organiser'); }}>Trip organiser</button>
                <button className="choice-btn" onClick={() => { handleUserAssign('manager'); }}>Manager</button>
            </nav>
        </header>)
}



export default App;