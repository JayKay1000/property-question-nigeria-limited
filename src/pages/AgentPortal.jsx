import React,{useEffect,useState} from "react";
import {base44} from "@/api/base44Client";
import {Loader2,ShieldCheck,FileCheck} from "lucide-react";


export default function AgentPortal(){

const [agent,setAgent]=useState(null);


useEffect(()=>{

async function load(){

const user =
await base44.auth.me();


const result =
await base44.entities.Agent.filter({

user_id:user.id

});


if(result.length){

setAgent(result[0]);

}

}


load();

},[]);



if(!agent){

return (
<div className="p-10">
Loading agent profile...
</div>
)

}



return (

<div className="p-6">


<h1 className="text-3xl font-bold">

Agents Hub

</h1>


<div className="mt-6 grid md:grid-cols-3 gap-5">


<div className="border rounded-xl p-5">

<ShieldCheck/>

<h3 className="font-bold">

Verification Status

</h3>

<p>

{agent.verification_status}

</p>


</div>



<div className="border rounded-xl p-5">

<FileCheck/>

<h3 className="font-bold">

Documents Submitted

</h3>


<p>

Your identity documents are under review.

</p>


</div>


</div>


</div>

)

}
