import {useState} from "react";
import {base44} from "@/api/base44Client";


export default function ProjectMediaUploader({ projectId, project, onUploaded }) {


const [files,setFiles]=useState([]);

const [uploading,setUploading]=useState(false);



const upload=async()=>{


if(!files.length){

alert("Please select files");

return;

}


try{


setUploading(true);



for(const file of files){


const uploaded =
await base44.integrations.Core.UploadFile({
file:file
});



if(!uploaded?.file_url){

throw new Error(
"Upload failed for "+file.name
);

}



await base44.entities.ProjectMedia.create({
  project_id: projectId,
  media_url: uploaded.file_url,
  media_type: file.type.includes("video") ? "video" : "image",
  title: file.name,
  visibility: "public",
});

// First uploaded image becomes the project's display (featured) image.
if (!file.type.includes("video") && !project?.featured_image_url) {
  await base44.entities.Project.update(projectId, { featured_image_url: uploaded.file_url });
  onUploaded?.();
}


}



alert(
"Images/videos uploaded successfully"
);



setFiles([]);



}

catch(error){

alert(error.message);

}


finally{

setUploading(false);

}



};



return(

<div className="border p-5 rounded mt-5">


<h3 className="font-bold mb-3">

Upload Project Images / Videos

</h3>


<input

type="file"

multiple

accept="image/*,video/*"

onChange={
e=>
setFiles(
Array.from(e.target.files)
)
}

/>



<button

disabled={uploading}

onClick={upload}

className="bg-orange-600 text-white px-4 py-2 mt-3 rounded"

>

{
uploading?
"Uploading..."
:
"Upload Files"
}


</button>


</div>

)


}