import React, {useEffect, useState} from "react";
import {base44} from "@/api/base44Client";


export default function AgentApprovals(){

const [agents,setAgents] = useState([]);
const [loading,setLoading] = useState(true);



const loadAgents = async()=>{

try{

const result =
await base44.entities.Agent.filter(
{
verification_status:"pending"
}
);


setAgents(result || []);

}

catch(error){

console.error(error);

}

finally{

setLoading(false);

}

};



useEffect(()=>{

loadAgents();

},[]);



const approveAgent = async(id)=>{


await base44.entities.Agent.update(

id,

{

verification_status:"verified",

status:"active",

verified_at:new Date().toISOString()

}

);


loadAgents();


};



const rejectAgent = async(id)=>{


await base44.entities.Agent.update(

id,

{

verification_status:"rejected",

status:"inactive"

}

);


loadAgents();


};



if(loading){

return <div className="p-6">
Loading agents...
</div>

}



return (

<div className="p-6">


<h1 className="text-3xl font-bold mb-6">

Agent Verification Portal

</h1>



{
agents.length===0 ?

<p>
No pending agents.
</p>


:

<div className="grid gap-5">


{
agents.map(agent=>(


<div

key={agent.id}

className="border rounded-xl p-5"

>


<h2 className="text-xl font-bold">

{agent.full_name || agent.name}

</h2>



<p>

Phone:
{agent.phone}

</p>



<p>

State:
{agent.resident_state}

</p>



<p>

LGA:
{agent.resident_lga}

</p>



<p>

Status:
{agent.verification_status}

</p>



<div className="flex gap-3 mt-5">


<button

className="bg-green-600 text-white px-4 py-2 rounded"

onClick={()=>approveAgent(agent.id)}

>

Approve

</button>



<button

className="bg-red-600 text-white px-4 py-2 rounded"

onClick={()=>rejectAgent(agent.id)}

>

Reject

</button>


</div>


</div>


))

}


</div>

}


</div>

)

}