import React, {useEffect, useState} from "react";
import {base44} from "@/api/base44Client";
import ProjectForm from "@/components/admin/ProjectForm";
import {useNavigate} from "react-router-dom";


export default function AdminProjects(){

const navigate = useNavigate();

const [projects,setProjects] = useState([]);

const [showForm,setShowForm] = useState(false);

const [editingProject,setEditingProject] = useState(null);



const loadProjects = async()=>{

const result =
await base44.entities.Project.list(
"-created_date"
);

setProjects(result);

};



useEffect(()=>{

loadProjects();

},[]);



const deleteProject = async(id)=>{


const confirm =
window.confirm(
"Are you sure you want to delete this project?"
);


if(!confirm)return;


await base44.entities.Project.delete(id);


loadProjects();


};



return (

<div className="p-6">


<div className="flex justify-between mb-8">


<h1 className="text-3xl font-bold">

Project Manager

</h1>



<button

className="bg-black text-white px-5 py-3 rounded"

onClick={()=>{

setEditingProject(null);

setShowForm(true);

}}

>

+ Create Project

</button>


</div>



{
showForm &&

<ProjectForm

project={editingProject}

close={()=>setShowForm(false)}

saved={()=>{

setShowForm(false);

loadProjects();

}}

/>

}



<div className="grid md:grid-cols-3 gap-6">


{
projects.map(project=>(


<div

key={project.id}

className="border rounded-xl p-5 shadow"


>


<img

src={
project.featured_image_url ||
"https://via.placeholder.com/400"
}

className="h-48 w-full object-cover rounded"

/>



<h2 className="text-xl font-bold mt-4">

{project.name}

</h2>


<p>

{project.location}

</p>



<div className="mt-5 flex flex-wrap gap-2">


<button

className="bg-blue-600 text-white px-3 py-2 rounded"

onClick={()=>{

setEditingProject(project);

setShowForm(true);

}}

>

Edit

</button>



<button

className="bg-purple-600 text-white px-3 py-2 rounded"

onClick={()=>{

navigate(
`/admin/projects/${project.id}`
)

}}

>

Manage

</button>



<button

className="bg-red-600 text-white px-3 py-2 rounded"

onClick={()=>deleteProject(project.id)}

>

Delete

</button>


</div>


</div>


))

}


</div>


</div>

)

}
