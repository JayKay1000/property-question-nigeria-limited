import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";


export default function ProjectMediaManager({projectId}) {

const [media,setMedia] = useState([]);


const loadMedia = async()=>{

const result =
await base44.entities.ProjectMedia.filter({
    project_id: projectId
});

setMedia(result);

};


useEffect(()=>{

if(projectId){
loadMedia();
}

},[projectId]);



const deleteMedia = async(id)=>{

const confirmDelete =
window.confirm(
"Delete this media file?"
);

if(!confirmDelete) return;


await base44.entities.ProjectMedia.delete(id);

loadMedia();

};



return (

<div className="mt-6">

<h3 className="font-bold mb-3">
Project Media
</h3>


<div className="grid md:grid-cols-4 gap-4">

{
media.map(item=>(

<div
key={item.id}
className="border rounded-lg p-3"
>


{
item.media_type==="video"

?

<video
src={item.media_url}
controls
className="w-full h-40"
/>

:

<img
src={item.media_url}
className="w-full h-40 object-cover"
/>

}


<button

className="bg-red-600 text-white px-3 py-2 rounded mt-3"

onClick={()=>deleteMedia(item.id)}

>

Delete

</button>


</div>

))

}

</div>


</div>

);

}
