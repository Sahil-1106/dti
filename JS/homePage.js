document.addEventListener('DOMContentLoaded', function () {
    const toggleSwitch = document.querySelector('.switch input');
  
    toggleSwitch.addEventListener('change', function () {
      if (this.checked) {
        document.body.classList.add('darkmode');
      } else {
        document.body.classList.remove('darkmode');
      }
    });
  });


document.querySelector(".exp").addEventListener('click',()=>{
    window.location.href="./../HTML/expense.html";
});

document.querySelector(".edu").addEventListener('click',()=>{
    window.location.href="./../HTML/educationHub.html";
})