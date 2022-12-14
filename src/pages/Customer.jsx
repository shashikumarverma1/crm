import React, { useEffect, useState } from "react";
import MaterialTable from "@material-table/core";
import { ExportCsv, ExportPdf } from '@material-table/exporters';
import { Modal, Button } from 'react-bootstrap'
import {fetchTicket,ticketCreation,ticketUpdation} from '../api/tickets.js'
import Sidebar from '../component/Sidebar'
import { Chart } from "react-google-charts";
import Footer from "../component/Footer.js";


const logoutFn=()=>{
    localStorage.clear();
      window.location.href ="/"
  }


  /*
UI : 
: Sidebar
: Cards : react circular progress bar 
: Material Table : to display all the tickets 
: Modal : raise a new ticket 
LOGIC : 
All state values : 
: modal : raise ticket, updateTicket
: ticketDetails : to store all the tickets raised by the user : fetch tickets 
: ticketCount : segregating the tickets according to their status
: currTicket : to update the details , edit the tickets
*/
const Customer = () => {
    const [ticketCreationModal, setTicketCreationModal] = useState(false);
    // get all the tickets ceated by the user 
        const [ticketDetails, setTicketDetails] = useState([]);
       
        const [ticketUpdateModal, setTicketUpdateModal] = useState(false);
        
        const [selectedCurrTicket, setSelectedCurrTicket] = useState({});
        const [ticketStatusCount, setTicketStatusCount] = useState({});
        
        const closeTicketCreationModal = () => setTicketCreationModal(false)
        const closeTicketUpdationModal = () => setTicketUpdateModal(false)
        const updateSelectedCurrTicket = (data) => setSelectedCurrTicket(data)
        
        const [message, setMessage] = useState("");


        const value = [
            ["Task", "STATUS"],
            ["OPEN" ,ticketStatusCount.pending],
            ['BLOCKED' ,ticketStatusCount.blocked],
            ['PROGRESS',ticketStatusCount.progress],
            ['CLOSED' ,ticketStatusCount.closed],
            
          ];

        // calling all apis on first render 
        useEffect(() => {
          (async () => {
              fetchTickets();
          })();
        }, []);

       
          // segregate tickets count
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
                
            });
            setTicketStatusCount(Object.assign({}, data))
        }

         // GET ALL TICKETS 
        const fetchTickets = () => {
              fetchTicket().then(function (response) {
              if (response.status === 200) {
                    setTicketDetails(response.data);
                    updateTicketCounts(response.data)
              }
          })
              .catch(function (error) {
                if(error.response.status === 401){
                        logoutFn();

                  }


              });
        }

        // POST A TICKET 
      const createTicket = (e)=>{
        e.preventDefault()
        // grab the new values 
        const data={
             title:e.target.title.value,
             description:e.target.description.value
        }
         // call the api 
        ticketCreation(data).then(function (response){
            // status == 201
            setMessage("Ticket Created Successfully");
            closeTicketCreationModal();
            fetchTickets();

        }).catch(function (error){
            if (error.response.status === 400)
                    setMessage(error.message);
                    else if(error.response.status === 401)
                    {
                      logoutFn()
                    }
                    else
                console.log(error);
        })

      }

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
                
            console.log(error.message);
        })


      }

      const editTicket = (ticketDetail) =>{
        const ticket={
            assignee: ticketDetail.assignee,
            description: ticketDetail.description,
            id:ticketDetail.id,
            reporter: ticketDetail.reporter,
            status: ticketDetail.status,
            title:ticketDetail.title
        }
        setSelectedCurrTicket(ticket)
        setTicketUpdateModal(true)
      }

      const onTicketUpdate = (e)=>{
        if(e.target.name==="title")
            selectedCurrTicket.title = e.target.value
        else if(e.target.name==="description")
            selectedCurrTicket.description = e.target.value
          else if(e.target.name==="status")
            selectedCurrTicket.status = e.target.value
        
        updateSelectedCurrTicket(Object.assign({}, selectedCurrTicket) )
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
            chartType="PieChart"
            data={value}
            options={{ title: "STATUS", is3D: true }}
            width={"78.5rem"}
            height={"60vh"}
          />
        </div>
      </div>
      <p className="text-success">{message}</p>
                  {/* <MuiThemeProvider theme={theme}> */}
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
                            backgroundColor: '#2cbc5c',
                            color: '#FFF'
                          },
                          rowStyle: {
                            backgroundColor: '#EEE',
                          }
                      }}
                      title="TICKETS RAISED BY YOU"
                  />
                  <input type="submit" className="form-control btn btn-success text-white fw-bolder my-2" value="RAISE TICKET" onClick={()=>setTicketCreationModal(true)} />

                {
                    ticketCreationModal ? (
                        <Modal
                          show={ticketCreationModal}
                          onHide={closeTicketCreationModal}
                          backdrop="static"
                          keyboard={false}
                          centered
                      >
                          <Modal.Header closeButton>
                              <Modal.Title >RAISE TICKET</Modal.Title>
                          </Modal.Header>
                          <Modal.Body>
                            <form onSubmit={createTicket} >
                                <div className="p-1">
                                    <div className="input-group">
                                        <input type="text" className="form-control" name="title" placeholder="Title" required/>
                                    </div>
                                    <div >
                                        <textarea id="form16" className="md-textarea form-control" rows="3" name="description" placeholder="Description" required></textarea>
                                    </div>
                                </div>
                                <div className="input-group justify-content-center">
                                    <div className="m-1">
                                        <Button variant="secondary"  onClick={() => closeTicketCreationModal()} >Cancel</Button>
                                    </div>
                                    <div className="m-1">
                                        <Button type="submit" variant="success" >Create</Button>
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
                                    <div className="input-group ">
                                        <div className="input-group mb-2 ">
                                            <label className="label input-group-text label-md ">Title</label>
                                            <input type="text" className="form-control" name="title" value={selectedCurrTicket.title} onChange={onTicketUpdate} required/>
                                        </div>                                    
                                        
                                        <div className="input-group mb-2">
                                            <label className="label input-group-text label-md ">Assignee</label>
                                            <input type="text" className="form-control"  value={selectedCurrTicket.assignee} disabled />
                                        </div>
                                        <div className="input-group mb-2">
                                        <label className="label input-group-text label-md ">Status</label>
                                            <select className="form-select" name="status" value={selectedCurrTicket.status} onChange={onTicketUpdate}>
                                                <option value="OPEN">OPEN</option>
                                                <option value="CLOSED">CLOSED</option>
                                            </select>
                                        </div>
                                       
                                        <div className="input-group mb-2">
                                          <textarea id="form16" className="form-control " rows="3"  name="description" placeholder="Description" value={selectedCurrTicket.description}  onChange={onTicketUpdate} required></textarea>
                                      
                                        </div>
                                       

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
                          </Modal.Body>
                          <Modal.Footer>
                          </Modal.Footer>


                      </Modal>
                    ):(
                        ""
                    )

                }
                
                   
              </div>
              <br/>
              <Footer/>
      </div>
  )
}

export default Customer