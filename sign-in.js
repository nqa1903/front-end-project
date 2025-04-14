document.querySelector("form").addEventListener("submit", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
  const usersData = JSON.parse(localStorage.getItem("usersData")) || { users: [] };

  if (savedUsers.length === 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "No users found. Please sign up first.",
    });
    return;
  }

  const matchedUser = savedUsers.find((user) => user.email === email && user.password === password);
  const matchedDataUser = usersData.users.find((user) => user.email === email && user.password === password);

  if (matchedUser && matchedDataUser) {
    localStorage.setItem("currentUserId", matchedDataUser.id);

    let timerInterval;
    Swal.fire({
      title: "Auto close alert!",
      html: `Sign in successfully <br> Redirecting to Dashboard page in <b>2</b> second`,
      timer: 2000,
      timerProgressBar: true,
      didOpen: () => {
        Swal.showLoading();
        const timer = Swal.getPopup().querySelector("b");
        timerInterval = setInterval(() => {
          timer.textContent = `${Math.ceil(Swal.getTimerLeft() / 1000)}`;
        }, 100);
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
    }).then((result) => {
      if (result.dismiss === Swal.DismissReason.timer) {
        window.location.href = "dashboard.html";
      }
    });
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Invalid email or password. Please try again.",
    });
  }
});
