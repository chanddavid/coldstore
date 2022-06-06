const modal = document.querySelector(".role_modal")
const edit_role_modal = document.querySelector(".edit_role_modal");

$("#add_roles").on("click", function (e){
    e.preventDefault();
    console.log("Add Roles....")
    toggleRoleModal();
})


$(".modal_container_close").on("click", function (e){
  toggleRoleModal();
  document.querySelector("#post_device").reset();
  $(".form-group").removeClass("has-error");
  $("#post_device").validate().resetForm();
})

$(modal).on("click", function(e){
    if(e.target === e.currentTarget){
        toggleRoleModal();
    }
})

function toggleRoleModal(){
    if(modal.style.display === "flex"){
        modal.style.display = "none";
    }
    else{
        modal.style.display = "flex";
    }
}

$(".edit_modal_container_close").on("click", function (e){
  toggleEditRoleModal();
  document.querySelector("#edit_device").reset();
})


function toggleEditRoleModal(data){
    if(edit_role_modal.style.display === "flex"){
        edit_role_modal.style.display = "none";
    }
    else{
        edit_role_modal.querySelector("#roleId").value = data.id;
        edit_role_modal.querySelector("input[name='name']").value = data.name;
        edit_role_modal.style.display = "flex";
    }
}