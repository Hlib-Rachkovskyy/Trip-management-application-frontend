import {useEffect, useState} from "react";
import './App.css';
import {UserHeader, UserView} from "./Users/User";
import {OrganiserHeader, OrganiserView} from "./Users/TripOrganiser";
import {ManagerHeader, ManagerView} from "./Users/Manager";
import {Popup, TouristServicesList} from "./Utils";

function App(){
    const [blockStateUser, setBlockStateUser] = useState(true);
    const [currentUserId, setCurrentUserId] = useState(1);
    const [userType, setUserType] = useState('option');
    const [view, setView] = useState('option');
    const [popupData, setPopupData] = useState(null);
    const [popup, setPopup] = useState(null);
    const [postData, setPostData] = useState([]);
    const [managementState, setManagementState] = useState(null);
    const [touristServices, setTouristServices] = useState([]);
    const [currentTouristService, setCurrentTouristService] = useState(null);
    const [currentTrip, setCurrentTrip] = useState({});
    const [hotelLayout, setHotelLayout] = useState(["name", "phoneNumbers", "state", "hotelWebsite", "hotelAddress", "hotelEmail"]);
    const [vehicleLayout, setVehicleLayout] = useState(["name", "phoneNumbers", "state", "vehicleType", "driverCompany"]);
    const [addHotelToTripLayout, setAddHotelToTripLayout] = useState(["hotelStartDate", "hotelEndDate", "daysInHotel"]);
    const [addVehicleToTripLayout, setAddVehicleToTripLayout] = useState(["startDate", "endDate", "startPoint"]);


    const props = {
        blockStateUser, setBlockStateUser,
        hotelLayout, setHotelLayout,
        vehicleLayout, setVehicleLayout,
        addHotelToTripLayout, setAddHotelToTripLayout,
        addVehicleToTripLayout, setAddVehicleToTripLayout,
        view, setView,
        popupData, setPopupData,
        popup, setPopup,
        userType, setUserType,
        postData, setPostData,
        managementState, setManagementState,
        touristServices, setTouristServices,
        currentTouristService, setCurrentTouristService,
        currentTrip, setCurrentTrip,
        currentUserId, setCurrentUserId
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
    return (
        <header className="Header">
            <nav>
                <button className="choice-btn" onClick={() => {props.setUserType('user') }}>User</button>
                <button className="choice-btn" onClick={() => { props.setUserType('organiser'); }}>Trip organiser</button>
                <button className="choice-btn" onClick={() => {props.setUserType('manager'); }}>Manager</button>
            </nav>
        </header>)
}



export default App;