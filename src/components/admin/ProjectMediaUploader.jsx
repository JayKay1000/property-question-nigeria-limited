import {useState} from "react";
import {base44} from "@/api/base44Client";


export default function ProjectMediaUploader({
projectId
}){


const [files,setFiles]=useState([]);



const upload=async()=>{


for(const file of files){


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
"video"
:
"image",

title:file.name

});


}


alert("Upload complete");


};



return(

<div className="border p-5 rounded mt-5">


<h3 className="font-bold">
Upload Images / Videos
</h3>



<input

type="file"

multiple

accept="image/*,video/*"

onChange={
e=>setFiles(
Array.from(e.target.files)
)
}

/>



<button

className="bg-orange-600 text-white px-4 py-2 mt-3 rounded"

onClick={upload}

>

Upload

</button>


</div>

)


}