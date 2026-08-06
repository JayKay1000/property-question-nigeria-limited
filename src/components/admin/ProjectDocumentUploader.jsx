import {base44} from "@/api/base44Client";


export default function ProjectDocumentUploader({
projectId
}){


const upload=async(e)=>{


const file=e.target.files[0];


const uploaded =
await base44.integrations.Core.UploadFile({
file
});



await base44.entities.ProjectDocument.create({

project_id:projectId,

document_url:
uploaded.file_url,

document_name:
file.name

});


alert("Document uploaded");


};



return(

<div className="mt-5">


<h3 className="font-bold">
Upload Documents
</h3>


<input

type="file"

accept=".pdf"

onChange={upload}

/>


</div>

)


}
