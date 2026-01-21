import React, { useState } from "react"
import './App.css'

 export default function App(){

const [Pramod , setPramod] = useState("")
const [increase , setIncrease] = useState(0)

const saveHistory = ()=>{
  const date = new Date();
  const dateString = date.toLocaleString();
  const historyEntry = `${dateString} - ${Pramod}: ${increase}\n`;
  
  const historyDiv1 = document.getElementById('history1');
  
  historyDiv1.innerText += "History :" + historyEntry;
  console.log(historyEntry);
   
  // Save to local storage
  localStorage.setItem('history', (localStorage.getItem('history') || '') + historyEntry);
  alert('History saved!');


}



  return(
    <>
    <div className="counter f">
      <input type="text" 
      value={Pramod}
      onChange={(e) => setPramod(e.target.value)}

      />
      <h1>
        {Pramod}
      </h1>
      <div className="gap">
      <span>{increase}</span>

      <button onClick={() => setIncrease(increase + 1)}
      style={ {backgroundColor : increase >= 10  ? "red" : "yellow"}}> Chal Bhai.....</button>
      
        <div className="record" id="history">
        <button onClick={() => setIncrease(0) } >Reset</button>       
        <button onClick={() => saveHistory()} >Record</button>       

        </div>
        <div className="div">
        <div id="history1">
          
          </div>
        </div>     
      </div>

    </div>
    
    </>
  )

}
