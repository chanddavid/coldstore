const modal = document.querySelector(".device_modal")
const edit_device_modal = document.querySelector(".edit_device_modal");

$("#add_device").on("click", function (e){
    e.preventDefault();
    console.log("Add device....")
    toggleDeviceModal();
})


$(".modal_container_close").on("click", function (e){
  toggleDeviceModal();
  document.querySelector("#post_device").reset();
  $(".form-group").removeClass("has-error");
  $("#post_device").validate().resetForm();
})

$(modal).on("click", function(e){
    if(e.target === e.currentTarget){
        toggleDeviceModal();
    }
})

function toggleDeviceModal(){

    if(modal.style.display === "flex"){
        modal.style.display = "none";
    }
    else{
        modal.style.display = "flex";
    }
}

$(".edit_modal_container_close").on("click", function (e){
  toggleEditDeviceModal();
  document.querySelector("#edit_device").reset();
})


function toggleEditDeviceModal(data){
    // let editcheckbox=document.getElementById('editcheckbox')

    if(edit_device_modal.style.display === "flex"){
        edit_device_modal.style.display = "none";
    }
    else{
        edit_device_modal.querySelector("#deviceId").value = data.id;
        edit_device_modal.querySelector("input[name='device_Name']").value = data.device_Name;
        edit_device_modal.querySelector("input[name='store']").value = data.store;
        edit_device_modal.querySelector("input[name='data']").value = data.data;
        edit_device_modal.querySelector("input[name='status']").value = data.status;
        
        let a=document.getElementsByClassName("ibox-bodyupdate")[0]
        let b= a.getElementsByClassName("editcheckbox")[0]
        if(data.status==true){
            edit_device_modal.style.display = "flex";
            b.checked=true
        }
        else{
            edit_device_modal.style.display = "flex";
            b.checked=false
        }
    }
}