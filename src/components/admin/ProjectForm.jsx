import {useState} from "react";
import {base44} from "@/api/base44Client";
import ProjectMediaUploader from "./ProjectMediaUploader";


export default function ProjectForm({
project,
onClose,
onSaved
}){


const [form,setForm]=useState({

name: project?.name || "",

short_description:
project?.short_description || "",

description:
project?.description || "",

location_state:
project?.location_state || "",

location_city:
project?.location_city || "",

location_address:
project?.location_address || "",

status:
project?.status || "draft",

featured_image_url:
project?.featured_image_url || ""

});



const saveProject = async()=>{


let saved;


if(project){

saved =
await base44.entities.Project.update(
project.id,
form
);

}

else{


saved =
await base44.entities.Project.create(
{
...form,
visibility:"draft"
}
);


}


onSaved(saved);


};




return (

<div className="bg-white shadow-xl rounded-xl p-6 mb-8">


<h2 className="text-2xl font-bold mb-5">

{project ? "Edit Project":"Create Project"}

</h2>



<input
className="border p-3 w-full mb-3"
placeholder="Project Name"
value={form.name}
onChange={
e=>setForm({
...form,
name:e.target.value
})
}
/>



<input
className="border p-3 w-full mb-3"
placeholder="Short Description"
value={form.short_description}
onChange={
e=>setForm({
...form,
short_description:e.target.value
})
}
/>



<textarea
className="border p-3 w-full mb-3"
rows="6"
placeholder="Detailed Description"
value={form.description}
onChange={
e=>setForm({
...form,
description:e.target.value
})
}
/>



<input
className="border p-3 w-full mb-3"
placeholder="State"
value={form.location_state}
onChange={
e=>setForm({
...form,
location_state:e.target.value
})
}
/>



<input
className="border p-3 w-full mb-3"
placeholder="City"
value={form.location_city}
onChange={
e=>setForm({
...form,
location_city:e.target.value
})
}
/>



<select
className="border p-3 w-full mb-3"
value={form.status}
onChange={
e=>setForm({
...form,
status:e.target.value
})
}
>

<option value="draft">
Draft
</option>

<option value="planning">
Planning
</option>

<option value="construction">
Construction
</option>

<option value="selling">
Selling
</option>

<option value="completed">
Completed
</option>


</select>



<ProjectMediaUploader
projectId={project?.id}
/>



<div className="flex gap-4 mt-5">


<button
className="bg-green-600 text-white px-6 py-3 rounded"
onClick={saveProject}
>
Save Project
</button>



<button
className="bg-gray-400 px-6 py-3 rounded"
onClick={onClose}
>
Cancel
</button>


</div>


</div>

);


}
