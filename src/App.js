import {useEffect, useState} from "react";
import './App.css';

function App(){
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




function UserView({props}) {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        let string;
        if (props.view === 'explore') {
            string = 'http://localhost:8080/user/1/trips/explore';
        } else if (props.view === 'registered') {
            string = 'http://localhost:8080/user/1/trips';
        } else {
            setData([]);
            return;
        }

        setLoading(true);
        fetch(string)
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Failed to fetch:', err);
                setLoading(false);
            });

    }, [props.view])

    if (loading) return <div>Loading...</div>;
    switch (props.view) {
        case 'form':
            return (<FormPage props={props}/>)
        case 'announcements':
            return (<AnnouncementsReadOnly props={props}/>)
        case 'registered':
            return (<PostList props={props} data={data} />);
        case 'explore':
            return (<PostList props={props} data={data} />);
    }
    return <></>;
}

function OrganiserView({props}){
    const [data, setData] = useState([]);

    const fetchData = async () => {
        const res = await fetch('http://localhost:8080/organiser/1/trips');
        const json = await res.json();
        setData(json);
    };

    useEffect(() => {
        fetchData();
    }, []);
    console.log(data)
    switch (props.view) {
        case 'trips-created':
            return (<PostList props={{...props }} data={data}/>)
        case 'tourist-services':
            return (<TouristServices props={props}/>)
    }
}


function ManagerView({props}){
    return (<>
        {props.view === 'explore' && (<PostList props={props}/>)}
        {props.view === 'add-announcement' && (<AnnouncementsWriteOnly props={props}/>)}

    </>)
}

function PostList({props, data}){
    console.log(data)
    return (
        <div className="container-list">
            {Array.isArray(data) && data?.map((value) =>
                (<PostBlock props={props} data={value}/>)
            )}
        </div>
    )
}

function PostBlock({props, data}) {

    const handleResign = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/${data?.id}/resign/${props?.currentUserId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const message = await response.text();
                alert("Failed: " + message);
                return;
            }

            alert("Successfully resigned from the trip.");
        } catch (err) {
            alert("Error occurred while resigning.");
        }
    };


    const handleApply = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: props.currentUserId,
                    tripId: data.id,
                }),
            });


            if (!response.ok) {
                if (response.status === 409) {
                    alert("You are already registered for this trip.");
                } else {
                    alert("Failed to apply to trip.");
                }
                return;
            }

            alert("Successfully applied!");

        } catch (error) {
            alert("Something went wrong.");
        }
    };

    return (<div className="container">
        <h5>Name: {data?.name}</h5>
        <p>Start date: {data?.startDate}</p>
        {props.userType === 'user' && (<button className='choice-btn' onClick={() => {
            props.setPopup('expand');
            props.setPopupData(data)
        }}>Expand</button>)}

        {props.view === 'registered' && props.userType === 'user' && <button className='choice-btn' onClick={handleResign} id="resing">Resign</button>}
        {props.view === 'explore' && props.userType === 'user' && <button className='choice-btn' onClick={handleApply} id="apply">Apply</button>}
        {props.userType === 'organiser' && <button className='choice-btn' onClick={() => {props.setPopup('view-users'); props.setPopupData(data)}}>Users</button>}
        {props.userType === 'organiser' && <button className='choice-btn' onClick={() => (props.setPopup('edit-trip'))}>Edit</button>}
        {props.userType === 'organiser' && <button className='choice-btn'
        onClick={() => { props.setPopup('manage'); props.setTouristServices(data); props.setView('tourist-services')}}>Manage</button>}


        {props.userType === 'manager' && <button className='choice-btn' onClick={() => (props.setView('add-announcement'))}>Write an announcement</button>}

        </div>)
        }

function UserPostExpanded({props}) {
    console.log(props.popupData)

    return (<div className="scrollableArea">{
            Object.entries(props.popupData).map(([key, value]) => (!Array.isArray(value) && key!== 'id' && (
                <p>
                    <strong>{key}:</strong> {value?.toString()}
                </p>)))}
        </div>)
}

function Popup({props}) {
    let hasRegisteredUser= null
    if (props.userType === 'user'){
        hasRegisteredUser = props.popupData.users.some(
        (userInTrip) =>
            userInTrip.user.id === props.currentUserId && userInTrip.role === 'IsPartOfTrip'
    );}


    return (
        <div className="popup">
            <div className="popup-content">
                {   props.userType === 'user' && (<UserPostExpanded props={props}/>)}
                {   props.userType === 'organiser' && (<PopupManagement props={props}/>)}

                {
                    props.view === 'registered' &&
                    hasRegisteredUser &&
                    (<button className='choice-btn' id="apply" onClick={() => {
                        props.setView('announcements');
                        props.setPopup(null);
                    }}>See announcements</button>)}

                {   props.popup !== 'manage' &&
                    (<button className="choice-btn" onClick={() => {
                        props.setPopup(null);
                    }}>Close</button>)}
            </div>
        </div>
    );
}

function AssignManager({props, organiserData}) {
    const [data, setData] = useState(null)
    const [selected, setSelected] = useState('');

    const fetchData = async () => {
        const res = await fetch(`http://localhost:8080/manager/${organiserData.company?.id}`, {});
        const json = await res.json();
        setData(json);
    };
    useEffect(() => {
        fetchData();
    }, []);
    console.log(data)

    const handleAssign = async () => {
        try {
            const response = await fetch(`http://localhost:8080/assign/manager`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    managerId: selected.id,
                    tripId: data.id,
                }),
            });


            if (!response.ok) {
                if (response.status === 409) {
                    alert("Manager was assigned.");
                } else {
                    alert("Failed to assign manager.");
                }
                return;
            }

            alert("Successfully applied!");

        } catch (error) {
            alert("Something went wrong.");
        }
    };

    return (
        <div>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}>
                <option value="">Select an item</option>
                {data.map((item) => (
                    <option key={item} value={item}>
                        {item.name}
                        <> </>
                        {item.surname}
                    </option>
                ))}
            </select>
            <button onClick={handleAssign} disabled={!selected}>
                Assign
            </button>
        </div>
    );
}

function PopupManagement({props}){
    const [data, setData] = useState()
    useEffect(() => {
        fetch("http://localhost:8080/organiser/1")
            .then((response) => {
                return response.json();
            }).then((data) => {
            setData(data)
        }).catch((err) => console.error('API Error:', err));

    }, []);
    switch (props.popup) {
        case 'create-trip':
            return (<CreateTripForm props={props} data={data}/>)
        case 'assign-manager':
            return (<AssignManager props={props} organiserData={data}/>)
        case 'edit-trip':
            const editData = data.trips
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

function CreateTripForm({props, data}) {

    const [form, setForm] = useState({
        name: '',
        registrationDateEnd: '',
        departurePoint: '',
        arrivalPoint: '',
        startDate: '',
        endDate: '',
        programDescription: '',
        numberOfUsersInGroup: '',
        price: '',
        registrationState: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('http://localhost:8080/organiser/trips', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: form.name,
                    registrationDateEnd: form.registrationDateEnd,
                    departurePoint: form.departurePoint,
                    arrivalPoint: form.arrivalPoint,
                    startDate: form.startDate,
                    endDate: form.endDate,
                    programDescription: form.programDescription,
                    numberOfUsersInGroup: Number(form.numberOfUsersInGroup),
                    price: Number(form.price),
                    registrationState: form.registrationState,
                    companyId: Number(data.company?.id),
                    organiserId: data.id,
                })
            });

            if (!response.ok) {
                const msg = await response.text();
                alert('Error: ' + msg);
                return;
            }
            alert('Trip saved successfully');
            props.setPopup('assign-manager');
        } catch (err) {
            console.error(err);
            alert('Submission failed');
        }
    };

    return (
        <div className="container-text">
            {Object.entries(form).map(([key, val]) => (
                <div key={key}>
                    <label>
                        {key}:
                        <input
                            name={key}
                            value={val}
                            onChange={handleChange}
                        />
                    </label>
                </div>
            ))}
            <button className="choice-btn" onClick={handleSubmit}>
                Submit
            </button>
        </div>
    );
}

function ManagementStateComponent({props}) {
    const [selectedItem, setSelectedItem] = useState(null);
    const handleAssign = (e) => {
        const id = e.target.value;
        setSelectedItem(id);
    };

    useEffect(() => {
        if (props.currentTouristService) {
            if (props.currentTouristService.vehicleType) {
                setSelectedItem('vehicle');
            } else if (props.currentTouristService.hotelAddress) {
                setSelectedItem('hotel');
            }
        }
    }, [props.currentTouristService]);


    console.log(selectedItem)
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
            console.log(props.currentTouristService)
            return (<div className="container-text">
                {props.currentTouristService == null && (
                    <select onChange={handleAssign}>
                        <option  value="">Select an item</option>
                        <option key="hotel" value="hotel-create" >Hotel</option>
                        <option key="vehicle" value="vehicle-create">Vehicle</option>
                    </select>
                )}

                { selectedItem === 'hotel-create' &&
                    (props.hotelLayout.map((key, index) => {
                        return (<div className="">{key}: <input className=""/></div>)}))
                }

                { selectedItem === 'vehicle-create' &&
                    (props.vehicleLayout.map((key, index) => {
                        return (<div className="">{key}: <input className=""/></div>)}))
                }

                {props.currentTouristService != null && Object.entries(props.currentTouristService).map(([key, value]) => {
                    return (!Array.isArray(value) && (<div className="">{key}: <input className="" value={value}/></div>))})}




                <button className="choice-btn" disabled={!selectedItem} onClick={() =>
                {props.setManagementState('add-list-to-trip');}}>Submit</button>
            </div>)
        case 'add-list-to-trip':
            return (<div>

                {(selectedItem === 'vehicle' || selectedItem === 'vehicle-create') && (props.addVehicleToTripLayout?.map((key, index) => {
                        return (<div className="">{key}: <input className=""/></div>)}))
                }
                {(selectedItem === 'hotel' || selectedItem === 'hotel-create') && (props.addHotelToTripLayout?.map((key, index) => {
                    return (<div className="">{key}: <input className=""/></div>)}))
                }

                <button onClick={() => {
                    setSelectedItem(null);
                    HandleTouristServiceManagementCompletion({props})
                }}>Submit
                </button>
                <button onClick={() => {
                    setSelectedItem(null);
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
    props.setPopup(null); props.setManagementState(null);
    props.setView('trips-created');
    props.setCurrentTouristService(null);
}

function ViewUsers({props}) {
    const [selectedId, setSelectedId] = useState('');
    const [selected, setSelected] = useState(null);
    const handleAssign = (e) => {
        const id = e.target.value;
        setSelectedId(id);
        const selectedItem = props.popupData.users?.find(item => item.id.toString() === id);
        setSelected(selectedItem);
    };

    const handleResign = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/${props.popupData.id}/resign/${selected.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const message = await response.text();
                alert("Failed: " + message);
                return;
            }

            alert("Successfully resigned from the trip.");
        } catch (err) {
            alert("Error occurred while resigning.");
        }
    };


    const handleAssignToTrip = async () => {
        try {
            const response = await fetch(`http://localhost:8080/user-trip/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId: selected.id,
                    tripId: props.popupData.id,
                    role: 'IsPartOfTrip'
                }),
            });


            if (!response.ok) {
                if (response.status === 409) {
                    alert("You are already registered for this trip.");
                } else {
                    alert("Failed to apply to trip.");
                }
                return;
            }

            alert("Successfully applied!");

        } catch (error) {
            alert("Something went wrong.");
        }
    };

    return (
        <div>
            <select value={selectedId} onChange={handleAssign}>
                <option value="">Select an item</option>
                {props.popupData.users?.map((item) => (
                    <option key={item.id} value={item.id}>
                        {item.user.name}
                        <> </>
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
            { selected?.role === 'isPartOfTrip' && (<button className="choice-btn" onClick={handleResign}>Delete</button>)}
            { selected?.role === 'Registered' && (<button className="choice-btn" onClick={handleAssignToTrip}>Assign to trip</button>)}

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

function FormPage({ props }) {
    const [company, setCompany] = useState('');
    const [text, setText] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        const payload = {
            companyName: company,
            text: text,
            userId: props.userId
        };

        try {
            const res = await fetch('/contact-form/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                alert('Form submitted successfully.');
                setCompany('');
                setText('');
            } else {
                const msg = await res.text();
                alert('Error: ' + msg);
            }
        } catch (err) {
            console.error(err);
            alert('Something went wrong.');
        }
    };

    return (
        <form className='form-container' onSubmit={handleSubmit}>
            <label htmlFor="company">Choose a company:</label>
            <select
                className='select-container'
                id="company"
                name="company"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
            >
                <option value="">--Select--</option>
                <option value="company1">company1</option>
                <option value="company2">company2</option>
                <option value="company3">company3</option>
            </select>

            <label htmlFor="form">Text:</label>
            <input
                className='input-container'
                type="text"
                id="form"
                name="form"
                value={text}
                onChange={(e) => setText(e.target.value)}
                required
            />
            <br /><br />
            <button className="submit" type="submit">Submit</button>
        </form>
    );
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

function TouristServicesList({ props }) {
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




    return (<div className="container" onClick={() =>
    {isVehicle && props.setCurrentTouristService(data.vehicle);
        isHotel && props.setCurrentTouristService(data.hotel);
        props.setPopup('manage'); }}>
        <h5>Name: {name}</h5>
        <p>Start date: {startDate}</p>
        </div>)
}
export default App;