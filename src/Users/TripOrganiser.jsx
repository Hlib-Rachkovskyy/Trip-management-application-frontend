import {useEffect, useState} from "react";
import {PostList, TouristServices, ViewUsers} from "../Utils";

export function OrganiserHeader({props}) {

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

export function OrganiserView({props}){
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

export function PopupManagement({props}){
    const [data, setData] = useState()

    const getOrganiserData = async () => {
        try {
            let organiser_data = await fetch('http://localhost:8080/organiser/1');
            let jsonData = await organiser_data.json()
            setData(jsonData)
        } catch (err) {
            alert("API error while trying to get Organiser information", err)
        }
    };
    useEffect(() => {
 /*       fetch("http://localhost:8080/organiser/1")
            .then((response) => {
                return response.json();
            }).then((data) => {
            setData(data)
        }).catch((err) => console.error('API Error:', err));*/
        getOrganiserData();
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



export function CreateTripForm({props, data}) {

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
