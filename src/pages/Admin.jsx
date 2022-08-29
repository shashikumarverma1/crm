import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import { Modal, Button } from 'react-bootstrap'
import Sidebar from '../component/Sidebar'



import {fetchTicket,ticketUpdation} from '../api/tickets.js'
import {getAllUser,updateUserData} from '../api/user'


// Psuedo code for put logic 
//  read the data ==> (ticket) => setState(ticket)
// grab the new Values ==> (data) => setState(data)
// call the api => function(id, data)
import { Chart } from "react-google-charts";
import Footer from "../component/Footer";

const logoutFn=()=>{
    localStorage.clear();
      window.location.href ="/"
  }
const Admin = (count) => {

  const [userList, setUserList] = useState([]);
  const [userDetail, setUserDetail] = useState({});
    // old values
  const [ticketDetails, setTicketDetails] = useState([]);
  const [ticketUpdateModal, setTicketUpdateModal] = useState(false);
   // new updated values 

  const [selectedCurrTicket, setSelectedCurrTicket] = useState({});
   // {new Obj } new values user 
// First update with selectedCurr Ticket ==> grab the specific row  ==> CURR VALUE 
// Second update : replacing old values with new data ==> NEW VVALUES THAT UOU ENTERED IN MODAL 
  const [ticketStatusCount, setTicketStatusCount] = useState({});

  const updateSelectedCurrTicket = (data) => setSelectedCurrTicket(data)
  const closeTicketUpdationModal = () => setTicketUpdateModal(false)
  const [userModal, setUserModal] = useState(false);
  const [message, setMessage] = useState("");
  const showUserModal = () => setUserModal(true);
  const closeUserModal = () => {
      setUserModal(false);
      setUserDetail({});
  }
  const value = [
    [ "Task", "STATUS"],
    ["OPEN" ,ticketStatusCount.pending],
    ['BLOCKED' ,ticketStatusCount.blocked],
    ['PROGRESS',ticketStatusCount.progress],
    ['CLOSED' ,ticketStatusCount.closed],
    
  ];

  useEffect(() => {
    (async () => {
        fetchUsers("")
        fetchTickets()
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

// user logic 
  const fetchUsers = (userId) => {
      getAllUser(userId).then(function (response) {
        if (response.status === 200) {
            if (userId) {
                setUserDetail(response.data[0])
                showUserModal()
            }
            
            else
                setUserList(response.data);
        }
    })
        .catch(function (error) {
            console.log(error);
        });
  }
// ticket logic 
  const fetchTickets = () => {
      fetchTicket().then(function (response) {
          if (response.status === 200) {     
              console.log(response);               
                setTicketDetails(response.data);
                updateTicketCounts(response.data);
                
          }
      })
          .catch(function (error) {
              if(error.response.status===401){
                  logoutFn();
                    
              }
              console.log(error);
          });
    }

  const updateUserDetail = () => {
    const data = {
        "userType": userDetail.userTypes,
        "userStatus": userDetail.userStatus,
        "userName": userDetail.name
    }
    updateUserData(userDetail.userId,data).then(function (response) {
        if (response.status === 200) {
            setMessage(response.message);
            let idx = userList.findIndex((obj => obj.userId === userDetail.userId));
            userList[idx] = userDetail
            closeUserModal();
            setMessage("User detail updated successfully");

        }
    })
        .catch(function (error) {
            if (error.status === 400)
                setMessage(error.message);
           else if(error.response.status===401){
                  // logoutFn();
                    
              }
            else
                console.log(error);
        });
}

const changeUserDetail = (e) => {
    if (e.target.name === "status")
        userDetail.userStatus = e.target.value
    else if (e.target.name === "name")
        userDetail.name = e.target.value
    else if (e.target.name === "type")
        userDetail.userTypes = e.target.value
    setUserDetail(userDetail)
    setUserModal(e.target.value);
}


 // read the existing values
const editTicket = (ticketDetail) =>{
  const ticket={
      assignee: ticketDetail.assignee,
      description: ticketDetail.description,
      id:ticketDetail.id,
      reporter: ticketDetail.reporter,
      status: ticketDetail.status,
      title:ticketDetail.title,
      ticketPriority:ticketDetail.ticketPriority
  }
  setSelectedCurrTicket(ticket)
  setTicketUpdateModal(true)
}

  // count the tickets

const updateTicketCounts = (tickets) =>{
  const data = {
      pending:0,
      closed:0,
      progress:0,
      blocked:0

  }
  tickets.forEach(x=>{
      if(x.status==="OPEN")
          data.pending+=1
      else if(x.status==="IN_PROGRESS")
          data.progress+=1
      else if(x.status==="BLOCKED")
          data.blocked+=1
      else
          data.closed+=1
  })
  setTicketStatusCount(Object.assign({}, data))
}


// read the updated value from the user 
const onTicketUpdate = (e)=>{
  if(e.target.name==="title")
      selectedCurrTicket.title = e.target.value
  else if(e.target.name==="description")
      selectedCurrTicket.description = e.target.value
    else if(e.target.name==="status")
      selectedCurrTicket.status = e.target.value
  else if(e.target.name==="assignee")
      selectedCurrTicket.assignee = e.target.value
  else if(e.target.name==="ticketPriority")
      selectedCurrTicket.ticketPriority = e.target.value

        // create a new object wit new values ==> object.assign 
// (target, source) target : new values , source : destination where you want your updated values 

  updateSelectedCurrTicket(Object.assign({}, selectedCurrTicket) )
}

// call the api 
const updateTicket = (e) =>{
  e.preventDefault()
  ticketUpdation(selectedCurrTicket.id,selectedCurrTicket).then(function (response){
      setMessage("Ticket Updated Successfully");
      closeTicketUpdationModal();
      fetchTickets();

  }).catch(function (error){
      if (error.response.status === 400)
          setMessage(error.message);
      else if(error.response.status === 401)
          logoutFn();
      else{
        console.log(error);
      }
          
  })


}
  return (
    <div className="bg-light min-vh-100">
      <div className="col-1"><Sidebar home="/" /></div>
      <div className="container">
        <h3 className="text-primary text-center">
          Welcome,
          {localStorage.getItem("name")}
        </h3>
        <p className="text-muted text-center">
          Take a quick looks at your admin status below.
        </p>

        {/* STATS CHARTS START HERE */}
        <div className="row  mx-2 text-center">
          <div className="Chart d-flex justify-content-end align-item-center vh-50">
            <Chart
            // className=" d-flex justify-content-center align-item-center "
              chartType="PieChart"
              data={value}
              options={{ title: "STATUS", is3D: true }}
              width={"78.5rem"}
              height={"60vh"}
              
            />
          </div>
        </div>
        {/* <hr /> */}
        <div className="text-success">{message.includes("User") ? message : ""}</div>
                  
                  {/* <MuiThemeProvider theme={theme}> */}
                  <MaterialTable
                      onRowClick={(event, rowData) => fetchUsers(rowData.userId)}
  
                      data={userList}
                      columns={[
                          {
                              title: "USER ID",
                              field: "userId",
                          },
                          {
                              title: "Name",
                              field: "name",
  
                          },
                          {
                              title: "EMAIL",
                              field: "email",
                              filtering: false
                          },
                          {
                              title: "ROLE",
                              field: "userTypes",
                              lookup: {
                                  "ADMIN": "ADMIN",
                                  "CUSTOMER": "CUSTOMER",
                                  "ENGINEER": "ENGINEER",
  
                              },
                          },
                          {
                              title: "Status",
                              field: "userStatus",
                              lookup: {
                                  "APPROVED": "APPROVED",
                                  "PENDING": "PENDING",
                                  "REJECTED": "REJECTED",
  
                              },
                          },
                      ]}
                        // actions={[
            //   {
            //     icon:Delete,
            //     tooptip: "Delete entry",
            //     onClick: (event, rowData) => deleteEntry(rowdata)
            //   }
            // ]}

                      options={{
                          filtering: true,
                          sorting: true,
                          exportMenu: [{
                              label: 'Download PDF',
                              exportFunc: (cols, datas) => ExportPdf(cols, datas, 'UserRecords')
                          }, {
                              label: 'Download CSV',
                              exportFunc: (cols, datas) => ExportCsv(cols, datas, 'userRecords')
                          }],
                          headerStyle: {
                              backgroundColor: 'darkblue',
                              color: '#FFF'
                            },
                            rowStyle: {
                              backgroundColor: '#EEE',
                            }
                      }}
                      title="USER RECORDS"
                  />
                  {/* </MuiThemeProvider>  */}
                  <br />
                  <div className="text-success">{message.includes("Ticke") ? message : ""}</div>

                  <MaterialTable
                      onRowClick={(event,rowData) => editTicket(rowData)}
  
                      data={ticketDetails}
                      columns={[
                          {
                              title: "Ticket ID",
                              field: "id",
                          },
                          {
                              title: "TITLE",
                              field: "title",
  
                          },
                          {
                              title: "DESCRIPTIONS",
                              field: "description",
                              filtering: false
                          },
                          {
                              title: "REPORTER",
                              field: "reporter",
                          },
                          {
                              title: "PRIORITY",
                              field: "ticketPriority",
                          },
                          {
                              title: "ASSIGNEE",
                              field: "assignee",
                          },
                          {
                              title: "Status",
                              field: "status",
                              lookup: {
                                  "OPEN": "OPEN",
                                  "IN_PROGRESS": "IN_PROGRESS",
                                  "BLOCKED": "BLOCKED",
                                  "CLOSED":"CLOSED"
  
                              },
                          },
                      ]}
                      options={{
                          filtering: true,
                          sorting: true,
                          exportMenu: [{
                              label: 'Download PDF',
                              exportFunc: (cols, datas) => ExportPdf(cols, datas, 'TicketRecords')
                          }, {
                              label: 'Download CSV',
                              exportFunc: (cols, datas) => ExportCsv(cols, datas, 'TicketRecords')
                          }],
                          headerStyle: {
                              backgroundColor: 'darkblue',
                              color: '#FFF'
                            },
                            rowStyle: {
                              backgroundColor: '#EEE',
                            }
                      }}
                      title="TICKETS RECORD"
                    />

{
  userModal ? (
  
  <Modal
      show={userModal}
      onHide={closeUserModal}
      backdrop="static"
      keyboard={false}
      centered
  >
      <Modal.Header closeButton>
          <Modal.Title >Edit Details</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <form onSubmit={updateUserDetail} >

              <div className="p-1">
                  <h5 className="card-subtitle mb-2 text-primary lead">User ID: {userDetail.userId}</h5>
                  <hr />
                  <div className="input-group mb-3">
                  <label className="label input-group-text label-md ">Name</label>
                      <input type="text" className="form-control" name="name" value={userDetail.name} onChange={changeUserDetail} />

                  </div>
                  <div className="input-group mb-3">
                  <label className="label input-group-text label-md ">Email</label>
                      <input type="text" className="form-control" name="name" value={userDetail.email} onChange={changeUserDetail} disabled />

                  </div>

                  <div className="input-group mb-3">
                  <label className="label input-group-text label-md ">Type</label>
                      <select className="form-select" name="type" value={userDetail.userTypes} onChange={changeUserDetail}>
                          <option value="ADMIN">ADMIN</option>
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="ENGINEER">ENGINEER</option>
                      </select>

                  </div>

                  <div className="input-group mb-3">
                  <label className="label input-group-text label-md ">Status</label>
                      <select name="status" className="form-select"
                          value={userDetail.userStatus} onChange={changeUserDetail}>
                          <option value="APPROVED">APPROVED</option>
                          <option value="REJECTED">REJECTED</option>
                          <option value="PENDING">PENDING</option>
                      </select>

                  </div>

              </div>
              <div className="input-group justify-content-center">
                <div className="m-1">
                <Button variant="secondary" onClick={() => closeUserModal()}>
              Close
          </Button>
                </div>
                <div className="m-1">
                <Button variant="primary" onClick={() => updateUserDetail()}>Update</Button>
                </div>
            </div>
          </form>
      </Modal.Body>
      <Modal.Footer>
      </Modal.Footer>
  </Modal>

    ):(
        ""
    )

}

{
  ticketUpdateModal ? (
                        <Modal
                          show={ticketUpdateModal}
                          onHide={closeTicketUpdationModal}
                          backdrop="static"
                          keyboard={false}
                          centered
                      >
                          <Modal.Header closeButton>
                              <Modal.Title >UPDATE TICKET</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <form onSubmit={updateTicket} >
                                <div className="p-1">
                                      <h5 className="card-subtitle mb-2 text-primary lead">Ticket ID: {selectedCurrTicket.id}</h5>
                                      <hr />
                                      
                                      <div className="input-group mb-3">
                                      <label className="label input-group-text label-md ">Title</label>
                                          <input type="text" className="form-control" name="title" value={selectedCurrTicket.title} onChange={onTicketUpdate} required/>
                                      </div>

                                      <div className="input-group mb-3">
                                      <label className="label input-group-text label-md ">PRIORITY</label>
                                        <input type="number" className="form-control" name="ticketPriority" value={selectedCurrTicket.ticketPriority} onChange={onTicketUpdate} min="1" max="5" required/><p className="text-danger">*</p>
  
                                      </div>

                                      
                                      <div className="input-group mb-3">
                                      <label className="label input-group-text label-md ">Assignee</label>
                                            <select className="form-select" name="assignee" value={selectedCurrTicket.assignee} onChange={onTicketUpdate}>
                                                          {/* we want the full user list printed ere so that we can assign the new user 
                            - The user List is coming from the getUsers api ===> userDetails
                            - We only want to print engineers 
                        */}
                                                        {
                                                            
                                                            userList.map((e,key) => {
                                                                if(e.userTypes==="ENGINEER")
                                                                    return <option key={key} value={e.value}>{e.name}</option>;
                                                                else
                                                                    return undefined
                                                            })
                                                            
                                                        }
                                            </select>
                                    </div>

                                    <div className="input-group mb-3">
                                    <label className="label input-group-text label-md ">Status</label>
                                          <select className="form-select" name="status" value={selectedCurrTicket.status} onChange={onTicketUpdate}>
                                            <option value="OPEN">OPEN</option>
                                            <option value="IN_PROGRESS">IN_PROGRESS</option>
                                            <option value="BLOCKED">BLOCKED</option>
                                            <option value="CLOSED">CLOSED</option>
                                          </select>
                                    </div>
                                      <div className="md-form amber-textarea active-amber-textarea-2">
                                        <textarea id="form16" className="md-textarea form-control" rows="3" name="description" placeholder="Description" value={selectedCurrTicket.description}  onChange={onTicketUpdate} required></textarea>
                                      </div>

                                      
                                  </div>

                                  <div className="input-group justify-content-center">
                                    <div className="m-1">
                                        <Button variant="secondary" onClick={() => closeTicketUpdationModal()}>Cancel</Button>
                                    </div>
                                    <div className="m-1">
                                        <Button type="submit" variant="primary" >Update</Button>
                                    </div>
                                </div>
                               
                            </form>
                            <p className="text-danger">* This field accept only number</p>
                          </Modal.Body>
                          <Modal.Footer>
                          </Modal.Footer>


                      </Modal>
    ):(
        ""
    )

}

   
</div>
<br />

<Footer/>
    </div>
  );
};

export default Admin;
