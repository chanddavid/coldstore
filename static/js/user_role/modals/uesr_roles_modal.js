let modal = document.querySelector(".user_roles_modal");
let edit_user_role_modal = document.querySelector(".edit_user_roles_modal")

$("#add_user_roles").on("click", function(e){
    e.preventDefault();
    document.querySelector("#post_user_roles").reset();
    toggleUserRolesModal();
    console.log("User Roles Clicked....")
})

$(modal).on("click", function(e){
    if(e.target === e.currentTarget){
        toggleUserRolesModal();
    }
})

$(".modal_container_close").on("click", function (e){
  toggleUserRolesModal();
  document.querySelector("#post_user_roles").reset();
  $(".chosen-select").val(null).trigger('change');
})

function toggleUserRolesModal(){
    if(modal.style.display === "flex"){
        modal.style.display = "none";
    }
    else{
        modal.style.display = "flex";

    }

}

$(".edit_modal_container_close").on("click", function(e){
    toggleUserRolesEditModal();
    document.querySelector("#edit_user_roles").reset();

})


function toggleUserRolesEditModal(data){
    $(function(){
        $(".edit-chosen-select").select2({width: "100%"});
    });
    document.querySelector("#edit_user_roles").reset();
    if(edit_user_role_modal.style.display === "flex"){
        edit_user_role_modal.style.display = "none";
    }
    else{
        console.log(data)
        // edit_user_role_modal.querySelectorAll("input[name='roles']").forEach(e=>{
        //     data.roles.forEach(role=>{
        //         $("input[name='roles'][value="+role+"]").prop('checked', true)
        //     })
        // })
        edit_user_role_modal.querySelector("#userRoleId").value = data.id;
        edit_user_role_modal.querySelector("#edit_user").value = data.user;
        $(".edit-chosen-select").val(data.roles).change();
        edit_user_role_modal.style.display = "flex";
    }
}