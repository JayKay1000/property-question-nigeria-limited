import {useState} from "react";
import {base44} from "@/api/base44Client";


export default function ProjectMediaUploader({
projectId
}){


const [file,setFile]=useState(null);



const upload=async()=>{


if(!file || !projectId)
return;


const uploaded =
await base44.integrations.Core.UploadFile({
file
});



await base44.entities.ProjectMedia.create({

project_id:projectId,

media_url:
uploaded.file_url,

media_type:
file.type.includes("video")
?
"marketing_video"
:
"image"

});


alert("Uploaded successfully");


};



return(

<div className="border rounded p-4">


<h3 className="font-bold mb-3">
Upload Project Media
</h3>


<input
type="file"
multiple
onChange={
e=>setFile(e.target.files[0])
}
/>


<button
className="mt-3 bg-orange-600 text-white px-4 py-2 rounded"
onClick={upload}
>
Upload
</button>


</div>


);


}
