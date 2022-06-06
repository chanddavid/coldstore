const darkToggleSwitch = document.querySelector('.dark-theme-switch input[type="checkbox"]');
const sleekToogleSwitch = document.querySelector('.sleek-theme-switch input[type="checkbox"]');
const cardbody = document.querySelectorAll('.card-body');
const currentTheme = localStorage.getItem('theme');
const ibox = document.querySelectorAll('.ibox');
const canvas = document.querySelectorAll('.ibox .card canvas');
const sideNavbar = document.querySelector(".page-sidebar");
const pills = document.querySelectorAll('.nav-pills.nav-pills-air .nav-link.active');

if (currentTheme) {
    document.documentElement.setAttribute('data-theme', currentTheme);

    if (currentTheme === 'dark') {
        darkToggleSwitch.checked = true;
        cardbody.forEach(cbody => {
            cbody.style.backgroundColor = "#1c1e21";
        })
        ibox.forEach(ibox => {
            ibox.style.backgroundColor = "#1c1e21";
        })
        sideNavbar.style.backgroundColor = "#1c1e21";
        sideNavbar.style.boxShadow = "0 5px 20px #1c1e21";
    }

    else if(currentTheme === 'sleek'){
        sleekToogleSwitch.checked = true;
        cardbody.forEach(cbody => {
            cbody.style.backgroundColor = "#84ceeb";
        })
        ibox.forEach(ibox => {
            ibox.style.backgroundColor = "#84ceeb";
        })
    }
}

function switchToDarkTheme(e) {
    if (e.target.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
        cardbody.forEach(cbody => {
            cbody.style.backgroundColor = "#1c1e21";
        });
        ibox.forEach(ibox => {
            ibox.style.backgroundColor = "#1c1e21";
        });
        sideNavbar.style.backgroundColor = "#1c1e21";
        sideNavbar.style.boxShadow = "0 5px 20px #1c1e21";
        localStorage.setItem('theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
        cardbody.forEach(cbody => {
            cbody.style.backgroundColor = "#fff";
        })
        ibox.forEach(ibox => {
            ibox.style.backgroundColor = "#fff";
        })
        sideNavbar.style.backgroundColor = "#fff";
        sideNavbar.style.boxShadow = "0 5px 20px #d6dee4";
        localStorage.setItem('theme', 'light');
    }
}

function switchToSleekTheme(e){
    if(e.target.checked){
        document.documentElement.setAttribute('data-theme', 'sleek');
        cardbody.forEach(cbody => {
            cbody.style.backgroundColor = "#84ceeb";
        })
        ibox.forEach(ibox => {
            ibox.style.backgroundColor = "#84ceeb";
        })
        localStorage.setItem('theme', 'sleek');
    }
    else{
        document.documentElement.setAttribute('data-theme', 'light');
         cardbody.forEach(cbody => {
            cbody.style.backgroundColor = "#fff";
        })
        ibox.forEach(ibox => {
            ibox.style.backgroundColor = "#fff";
        })
        localStorage.setItem('theme', 'light');
    }
}

darkToggleSwitch.addEventListener('change', switchToDarkTheme, false);
sleekToogleSwitch.addEventListener('change', switchToSleekTheme, false);