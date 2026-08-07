import {useState} from "react";
import {base44} from "@/api/base44Client";
import ProjectMediaUploader from "./ProjectMediaUploader";
import ProjectMediaManager from "./ProjectMediaManager";
import ProjectDocumentUploader from "./ProjectDocumentUploader";


export default function ProjectForm({
project,
close,
saved
}){


const [currentProject,setCurrentProject]=useState(project);



const [form,setForm]=useState({
    

name:project?.name || "",

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
project?.status || "planning",

visibility:
project?.visibility || "private",

seo_title:
project?.seo_title || "",

seo_description:
project?.seo_description || "",


category:"",

property_type:"",

land_size:"",

number_of_units:"",

price_range:"",

amenities:"",

payment_plan:"",

completion_date:""

});



const saveProject=async()=>{


try{


let result;


if(project){


result =
await base44.entities.Project.update(
project.id,
form
);


}

else{


result =
await base44.entities.Project.create(
form
);


}



setCurrentProject({
...result
});


alert("Project saved successfully");


saved();


}


catch(error){

alert(error.message);

}


};



return(

<div className="bg-white p-6 rounded-xl shadow mb-8">


<h2 className="text-2xl font-bold mb-5">

{
project?
"Modify Project":
"Create Project"
}

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



<textarea

className="border p-3 w-full mb-3"

placeholder="Detailed Description"

rows="8"

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
placeholder="Project Category"
value={form.category}
onChange={
e=>setForm({
...form,
category:e.target.value
})
}
/>


<input
className="border p-3 w-full mb-3"
placeholder="Property Type"
value={form.property_type}
onChange={
e=>setForm({
...form,
property_type:e.target.value
})
}
/>


<input
className="border p-3 w-full mb-3"
placeholder="Land Size"
value={form.land_size}
onChange={
e=>setForm({
...form,
land_size:e.target.value
})
}
/>

<input
className="border p-3 w-full mb-3"
placeholder="Location"
value={form.location_address}
onChange={
e=>setForm({
...form,
location_address:e.target.value
})
}
/>



<select

className="border p-3 w-full mb-3"

value={form.visibility}

onChange={
e=>setForm({
...form,
visibility:e.target.value
})
}

>


<option value="private">
Private
</option>


<option value="public">
Publish
</option>


</select>



<button

onClick={saveProject}

className="bg-green-600 text-white px-6 py-3 rounded"

>

Save Project

</button>



{
currentProject &&

<>

<ProjectMediaUploader
projectId={currentProject.id}
/>


<ProjectMediaManager
projectId={currentProject.id}
/>


<ProjectDocumentUploader
projectId={currentProject.id}
/>


</>

}



</div>


)


}