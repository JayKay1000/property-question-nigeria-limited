import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import ProjectForm from "@/components/admin/ProjectForm";

export default function AdminProjects() {

    const [projects, setProjects] = useState([]);
    const [editingProject, setEditingProject] = useState(null);
    const [showForm, setShowForm] = useState(false);


    const loadProjects = async () => {

        const data = await base44.entities.Project.list(
            "-created_date",
            200
        );

        setProjects(data);

    };


    useEffect(() => {
        loadProjects();
    }, []);



    const deleteProject = async(id)=>{

        const confirmDelete =
        window.confirm(
            "Are you sure you want to delete this project?"
        );


        if(!confirmDelete) return;


        await base44.entities.Project.delete(id);


        loadProjects();

    };



    return (

<div className="container mx-auto p-6">


<div className="flex justify-between items-center mb-8">

<h1 className="text-3xl font-bold">
Project Management
</h1>


<button
className="bg-orange-600 text-white px-5 py-3 rounded-lg"
onClick={()=>{
setEditingProject(null);
setShowForm(true);
}}
>
+ Add New Project
</button>


</div>




{showForm && (

<ProjectForm

project={editingProject}


close={()=>{

setShowForm(false);

setEditingProject(null);

}}


saved={()=>{

setShowForm(false);

setEditingProject(null);

loadProjects();

}}

/>

)}




<div className="grid md:grid-cols-3 gap-6">


{projects.map(project=>(


<div
key={project.id}
className="border rounded-xl overflow-hidden shadow"
>


<img
src={project.featured_image_url}
className="h-48 w-full object-cover"
/>


<div className="p-5">


<h2 className="font-bold text-xl">
{project.name}
</h2>


<p className="text-sm text-gray-500">
{project.status}
</p>


<div className="flex gap-3 mt-5">


<button
className="bg-blue-600 text-white px-4 py-2 rounded"
onClick={()=>{

setEditingProject(project);
setShowForm(true);

}}
>
Edit
</button>



<button
className="bg-red-600 text-white px-4 py-2 rounded"
onClick={()=>deleteProject(project.id)}
>
Delete
</button>


</div>


</div>


</div>


))}


</div>


</div>


);

}
