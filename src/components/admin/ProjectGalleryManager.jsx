import React,{useEffect,useState} from "react";
import {base44} from "@/api/base44Client";


export default function ProjectGalleryManager({
projectId
}){


const [media,setMedia]=useState([]);


const load=async()=>{

const result =
await base44.entities.ProjectMedia.filter({

project_id:projectId

});


setMedia(result);

};



useEffect(()=>{

load();

},[]);



const upload = async(e)=>{


const files =
Array.from(e.target.files);



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
"marketing_video"
:
"image"


});


}



load();


};



const remove=async(id)=>{


await base44.entities.ProjectMedia.delete(id);


load();


};



return (

<div>


<input

type="file"

multiple

accept="image/*,video/*"

onChange={upload}

/>



<div className="grid md:grid-cols-4 gap-4 mt-5">


{
media.map(item=>(


<div key={item.id}>


{
item.media_type==="image"

?

<img

src={item.media_url}

className="h-32 w-full object-cover"

/>

:

<video

src={item.media_url}

controls

className="h-32 w-full"

/>

}



<button

className="bg-red-600 text-white px-3 py-1 mt-2 rounded"

onClick={()=>remove(item.id)}

>

Delete

</button>


</div>


))

}


</div>


</div>

)


}
