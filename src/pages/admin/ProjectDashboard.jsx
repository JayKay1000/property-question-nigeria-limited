import React,{useEffect,useState} from "react";
import {useParams} from "react-router-dom";
import {base44} from "@/api/base44Client";

import ProjectGalleryManager 
from "@/components/admin/ProjectGalleryManager";

import ProjectDocumentManager
from "@/components/admin/ProjectDocumentManager";


export default function ProjectDashboard(){


const {id}=useParams();


const [project,setProject]=useState(null);



useEffect(()=>{


async function load(){

const data =
await base44.entities.Project.get(id);

setProject(data);


}


load();


},[]);



if(!project)

return <div>
Loading...
</div>



return (

<div className="p-6">


<h1 className="text-3xl font-bold">

{project.name}

</h1>


<p className="mt-2">

{project.description}

</p>



<hr className="my-8"/>



<h2 className="text-xl font-bold">

Project Media

</h2>


<ProjectGalleryManager

projectId={id}

/>



<hr className="my-8"/>



<h2 className="text-xl font-bold">

Project Documents

</h2>


<ProjectDocumentManager

projectId={id}

/>



</div>

)


}
