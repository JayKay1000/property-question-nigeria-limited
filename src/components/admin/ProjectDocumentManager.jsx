import React from "react";
import {base44} from "@/api/base44Client";


export default function ProjectDocumentManager({
projectId
}){


const upload=async(e)=>{


const file=e.target.files[0];


const uploaded=
await base44.integrations.Core.UploadFile({
file
});



await base44.entities.Project.update(

projectId,

{

documents:[
uploaded.file_url
]

}

);


alert(
"Document uploaded"
);


};



return(

<div>


<input

type="file"

accept=".pdf,.doc,.docx"

onChange={upload}

/>


</div>


)


}
