import {useEffect, useState} from "react";
import './App.css';

function App(){
    const [userType, setUserType] = useState('option'); // user, organiser, manager,
    const [view, setView] = useState('option'); //User: explore, registered, form, announcements, Organiser: create-tour, edit-tour, assign-organiser, trips-created, add-announcements
    const [popupData, setPopupData] = useState(null); // expand, user-data, and start and end tourist services
    const [popup, setPopup] = useState(null);
    const [postData, setPostData] = useState([]);
    const [managementState, setManagementState] = useState(null); // add, edit, delete
    const [touristServices, setTouristServices] = useState([]);
    const [currentTouristService, setCurrentTouristService] = useState({});
    const [currentTrip, setCurrentTrip] = useState({});

    /* explore */
    const props = {
        view, setView,
        popupData, setPopupData,
        popup, setPopup,
        userType, setUserType,
        currentPostExpanded: {Name: null},
        postData, setPostData,
        managementState, setManagementState,
        touristServices, setTouristServices,
        currentTouristService, setCurrentTouristService,
        currentTrip, setCurrentTrip
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

function ManagerHeader({props}){
    return (<header className="Header">
            <nav>
                <button className="choice-btn" onClick={() => props.setView('explore')}>Explore</button>
            </nav>
        </header>
    )
}

function OrganiserHeader({props}) {
    return (<header className="Header">
        <nav>
            <button className="choice-btn" onClick={() => props.setPopup('create-trip')}>Create trip</button>
            <button className="choice-btn" onClick={() => props.setView('trips-created')}>Trips</button>
            <button className="choice-btn" onClick={() => props.setView('form')}>View written forms</button>
            {props.view === 'tourist-services' && (<h1>{props.touristServices.name}</h1>)}
        </nav>
    </header>)

}

function FetchData(string){
    const [data, setData] = useState([])
    useEffect(() => {
        fetch(string)
            .then((response) => {
                return response.json();
            }).then((data) => {
            setData(data)
        }).catch((err) => console.error('API Error:', err));

    }, []);
    console.log(data)
    return data;
}

function UserView({props}) {
    switch (props.view) {
        case 'explore': // make on which is not registred
            return (<PostList props={props}/>)
        case 'registered':
            const string = 'http://localhost:8080/user/1/trips'
            const data = FetchData(string)
            return (<PostList props={props} data={data}/>)
        case 'form':
            return (<FormPage props={props}/>)
        case 'announcements':
            return (<AnnouncementsReadOnly props={props}/>)
    }

    return (<></>)
}

function ManagerView({props}){
    return (<>
        {props.view === 'explore' && (<PostList props={props}/>)}
        {props.view === 'add-announcement' && (<AnnouncementsWriteOnly props={props}/>)}

    </>)
}

function OrganiserView({props}){
    let data = FetchData('http://localhost:8080/organiser/1/trips')
    console.log(data)
    switch (props.view) {
        case 'trips-created':
            return (<PostList props={props} data={data}/>)
        case 'tourist-services':
            return (<TouristServices props={props}/>)
    }
}

function PostList({props, data}){
    return (
        <div className="container-list">
            {Array.isArray(data) && data?.map((value) =>
                (<PostBlock props={props} data={value}/>)
            )}
        </div>
    )
}

function PostBlock({props, data}) {
    return (<div className="container">
        <h5>Name: {data?.name}</h5>
        <p>Start date: {data?.startDate}</p>
        {props.userType === 'user' && (<button className='choice-btn' onClick={() => {
            props.setPopup('expand');
            props.setPopupData(data)
        }}>Expand</button>)}

        {props.view === 'registered' && props.userType === 'user' && <button className='choice-btn' id="resing">Resign</button>}
        {props.view === 'explore' && props.userType === 'user' && <button className='choice-btn' id="apply">Apply</button>}
        {props.userType === 'organiser' && <button className='choice-btn' onClick={() => {props.setPopup('view-users'); props.setPopupData(data.users)}}>Users</button>}
        {props.userType === 'organiser' && <button className='choice-btn' onClick={() => (props.setPopup('edit-trip'))}>Edit</button>}
        {props.userType === 'organiser' && <button className='choice-btn'
        onClick={() => { props.setPopup('manage'); props.setTouristServices(data); props.setView('tourist-services')}}>Manage</button>}


        {props.userType === 'manager' && <button className='choice-btn' onClick={() => (props.setView('add-announcement'))}>Write an announcement</button>}

        </div>)
        } // make loader in future

function UserPostExpanded({props}) {
    console.log(props.popupData)

    return (<div className="scrollableArea">{
            Object.entries(props.popupData).map(([key, value]) => (!Array.isArray(value) && (
                <p>
                    <strong>{key}:</strong> {value?.toString()}
                </p>)))}
        </div>)
}

function AssignManager({props}) {
    const items = ['Item A', 'Item B', 'Item C'];
    const [selected, setSelected] = useState('');

    const handleAssign = () => {
        if (selected) {
            console.log('Assigned:', selected);
        }
    };

    return (
        <div>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">Select an item</option>
                {items.map((item) => (
                    <option key={item} value={item}>
                        {item}
                    </option>
                ))}
            </select>
            <button onClick={handleAssign} disabled={!selected}>
                Assign
            </button>
        </div>
    );
}

function Popup({
                   props
               }) {
    return (
        <div className="popup">
            <div className="popup-content">
                {props.userType === 'user' && (<UserPostExpanded props={props}/>)}
                {props.userType === 'organiser' && (<PopupManagement props={props}/>)}
                {props.popup === 'expand' &&
                    (<button className='choice-btn' id="apply" onClick={() => {
                        props.setView('announcements');
                        props.setPopup(null);
                    }}>See announcements</button>)}
                {props.popup !== 'manage' && (<button className="choice-btn" onClick={() => {props.setPopup(null); props.setView('explore')}}>Close</button>)}


            </div>
        </div>
    );
}

function PopupManagement({props}){
    console.log(props.popup)
    switch (props.popup) {
        case 'create-trip':
            const data = FetchData('http://localhost:8080/organiser/1/trips/1')
            return (<div className="container-text">
                {Object.entries(data).map(([key, value]) => {
                    return (!Array.isArray(value) && (<div className="">{key}: <input className=""/></div>))
                })}
                <button onClick={() => {props.setPopup('assign-manager')}}>Submit</button>
            </div>)
        case 'assign-manager':
            return (<AssignManager props={props}/>)
        case 'edit-trip':
            const editData = FetchData('http://localhost:8080/organiser/1/trips/1')
            console.log(editData)
            return (<div className="container-text">
                {Object.entries(editData).map(([key, value]) => {
                    return (!Array.isArray(value) && (<div className="">{key}: <input className=""/></div>))
                })}
                <button onClick={() => {

                }}>Submit
                </button>
                <button onClick={() => {
                     props.setPopup('assign-manager')
                }}>Add manager
                </button>

            </div>)
        case 'view-users':
            return <ViewUsers props={props}/>
        case 'manage': // add tour
            return (<ManagementStateComponent props={props}/>)
     }
}

function ManagementStateComponent({props}) {
    console.log(props.currentTouristService)
    switch (props.managementState) {
        case 'manage-edit':
            props.setManagementState('edit-list')
            props.setPopup(null)
            break;
        case 'edit-list':
            return (<div className="container-text">
                {Object.entries(props.currentTouristService).map(([key, value]) => {
                    return (!Array.isArray(value) && (<div className="">{key}: <input className="" value={value}/></div>))
                })}
                <button onClick={() =>
                {
                    HandleTouristServiceManagementCompletion({props})
                }}>Submit</button>
            </div>)
        case 'manage-add':
            return (<div className="container-text">
                <button className="choice-btn" onClick={() => {
                    props.setManagementState('add-list');
                }}>Add new
                </button>
                <button className="choice-btn" onClick={() => {
                    props.setManagementState('add-copy')
                }}>Add new as copy
                </button>
            </div>);
        case 'add-copy':
            props.setManagementState('add-list')
            props.setPopup(null)
            break;
        case 'add-list':
            return (<div className="container-text">
                {Object.entries(props.currentTouristService).map(([key, value]) => {
                    return (!Array.isArray(value) && (<div className="">{key}: <input className="" value={value}/></div>))
                })}
                <button onClick={() =>
                {props.setManagementState('add-list-to-trip');}}>Submit</button>
            </div>)
        case 'add-list-to-trip': // hotel vehicle checker
            return (<div>
                {Object.entries(props.currentTouristService).map(([key, value]) => {
                    return (!Array.isArray(value) && (
                        <div className="">{key}: <input className="" value={value}/></div>))
                })}
                <button onClick={() => {
                    HandleTouristServiceManagementCompletion({props})
                }}>Submit
                </button>
                <button onClick={() => {
                    HandleTouristServiceManagementCompletion({props})
                }}>Skip
                </button>
            </div>)
        case 'manage-delete':
            return (<div>
                <h3>From where do you want delete this service</h3>
                <button className="choice-btn" onClick={() => {
                    props.setManagementState('delete-from-trip');
                    props.setPopup(null)
                }}>Trip
                </button>
                <button className="choice-btn" onClick={() => {props.setManagementState('delete-choice'); props.setPopup(null)}}>System</button>
            </div>);
        case 'delete-from-trip':
            return (<div>
                <h3>Choose tour from which trip do you want delete service</h3>
                <select>
                    <option>A</option>
                </select>
                <button className="choice-btn" onClick={() => {props.setManagementState('delete-choice')}}>Delete</button>
            </div>);
        case 'delete-choice':
            return (<div>
                <h3>Are you sure that you want to delete?</h3>
                <button className="choice-btn" onClick={() => {
                    HandleTouristServiceManagementCompletion({props})
                }}>Yes
                </button>
                <button className="choice-btn" onClick={() => {
                    HandleTouristServiceManagementCompletion({props})
                }}>No
                </button>
            </div>);
        default:
            return (<div>
            <h3>Trip manager for tour {}</h3>
            <button className="choice-btn" onClick={() => { props.setManagementState('manage-add');}}>Add</button>
            <button className="choice-btn" onClick={() => { props.setManagementState('manage-edit')}}>Edit</button>
            <button className="choice-btn" onClick={() => { props.setManagementState('manage-delete');}}>Delete</button>
        </div>);
    }
}

function HandleTouristServiceManagementCompletion({props}){
    props.setPopup(null); props.setManagementState(null); props.setView('trips-created')
}

function ViewUsers({props}) {
    const [selectedId, setSelectedId] = useState('');
    const [selected, setSelected] = useState(null);
    const handleAssign = (e) => {
        const id = e.target.value;
        setSelectedId(id);
        const selectedItem = props.popupData?.find(item => item.id.toString() === id);
        setSelected(selectedItem);
    };
    return (
        <div>
            <select value={selectedId} onChange={handleAssign}>
                <option value="">Select an item</option>
                {props.popupData?.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.user.name}
                        {item.user.surname}
                    </option>
                ))}
            </select>
        {
            selected && typeof selected === 'object' && (
                <div className="scrollableArea">
                {Object.entries(selected).map(([key, value]) =>
                    (key !== "id" && key !=="user" && (<p key={key}>
                            {(<strong>{key}:</strong>)} {value?.toString()}
                        </p>))) }

                    {Object.entries(selected.user).map(([key, value]) => (
                        (key !== "id" && (<p key={key}>
                            <strong>{key}:</strong> {value?.toString()}
                        </p>))
                    ))}
                </div>
            )}
            { selected?.role === 'IsPartOfTour' && (<button onClick={handleAssign}>Delete</button>)}
            { selected?.role === 'Registered' && (<button className="choice-btn" onClick={handleAssign}>Assign</button>)}

        </div>
    );
}



function AnnouncementsReadOnly({
    props
}) {
    const [selectedUser, setSelectedUser] = useState(null);

    const announcements = [{name: 'someGuy', text: 'sometext'}, {name: 'someGuy', text: 'sometext'}]
    return (<div className="announcement">
            {announcements.map(announcement => (
                <div className="announcement-block">
                    <div className="line" onClick={() => {
                        props.setPopup(null)
                    }}>{announcement.name}</div>
                    <div className="line">{announcement.text}</div>
                </div>
            ))}
        </div>
    )
}

function FormPage({
    props
}) {
    return (<div className='form-container'>
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

function AnnouncementsWriteOnly({ props }) {
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


function FormRead({props}){
    return (null)
}

function TouristServices({ props }){

    return (<TouristServicesList props={props}/>

    )
}

function TouristServicesList({ props }) { // current post to make (make showup which edited)
    return (
        <div className="container-list">
            {props.touristServices.vehiclesInTrip?.map((vehicle, index) =>
                (<TouristServiceBlock props={props} data={vehicle}/>)) }
            {props.touristServices.hotelsInTrip?.map((hotel, index) =>
                (<TouristServiceBlock props={props} data={hotel}/>)) }
        </div>
    )
}

function TouristServiceBlock({ props, data }){
    const isVehicle = !!data.vehicle;
    const isHotel = !!data.hotel;
    const name = isVehicle
        ? data.vehicle.name
        : isHotel
            ? data.hotel.name
            : "Unknown";

    const startDate = isVehicle
        ? data.vehicleStartDate || data.startDate
        : isHotel
            ? data.hotelStartDate || data.startDate
            : "Unknown";



// hotel and vehicle make
    return (<div className="container" onClick={() =>
    {isVehicle && props.setCurrentTouristService(data.vehicle);
        isHotel && props.setCurrentTouristService(data.hotel);
        props.setPopup('manage'); }}>
        <h5>Name: {name}</h5>
        <p>Start date: {startDate}</p>
        </div>)
}
export default App;